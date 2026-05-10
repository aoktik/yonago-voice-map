-- =============================================
-- セキュリティ修正 #7, #8, #9
-- =============================================

-- === #7: 賛同・投票のRPC関数化（任意値設定防止） ===

-- 賛同の増減を+1/-1に制限するRPC関数
CREATE OR REPLACE FUNCTION toggle_agree(p_post_id uuid, p_delta int)
RETURNS void AS $$
BEGIN
  IF p_delta NOT IN (1, -1) THEN
    RAISE EXCEPTION 'Invalid delta';
  END IF;
  UPDATE posts SET agrees = GREATEST(0, agrees + p_delta) WHERE id = p_post_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Post not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 投票の増減を-1/0/1に制限するRPC関数
CREATE OR REPLACE FUNCTION update_topic_vote(p_topic_id text, p_likes_delta int, p_dislikes_delta int)
RETURNS void AS $$
BEGIN
  IF p_likes_delta NOT IN (-1, 0, 1) OR p_dislikes_delta NOT IN (-1, 0, 1) THEN
    RAISE EXCEPTION 'Invalid delta';
  END IF;
  UPDATE youtube_topics
  SET likes = GREATEST(0, likes + p_likes_delta),
      dislikes = GREATEST(0, dislikes + p_dislikes_delta)
  WHERE id = p_topic_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Topic not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- anon から直接 UPDATE を完全に禁止（RPC経由のみ許可）
REVOKE UPDATE (agrees) ON public.posts FROM anon;
REVOKE UPDATE (likes, dislikes) ON public.youtube_topics FROM anon;


-- === #8: 投稿レート制限（スパム対策） ===

-- 投稿のレート制限（1分間に10件まで）
CREATE OR REPLACE FUNCTION check_post_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count int;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM posts WHERE created_at > NOW() - INTERVAL '1 minute';
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'Too many submissions. Please wait.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_rate_limit ON posts;
CREATE TRIGGER post_rate_limit
BEFORE INSERT ON posts
FOR EACH ROW EXECUTE FUNCTION check_post_rate_limit();

-- 改善報告のレート制限（1分間に10件まで）
CREATE OR REPLACE FUNCTION check_report_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count int;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM resolve_reports WHERE created_at > NOW() - INTERVAL '1 minute';
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'Too many submissions. Please wait.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS report_rate_limit ON resolve_reports;
CREATE TRIGGER report_rate_limit
BEFORE INSERT ON resolve_reports
FOR EACH ROW EXECUTE FUNCTION check_report_rate_limit();


-- === #9: 管理者パスワードのブルートフォース対策 ===

-- 失敗記録テーブル
CREATE TABLE IF NOT EXISTS admin_failed_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  attempted_at timestamptz DEFAULT now()
);

ALTER TABLE admin_failed_attempts ENABLE ROW LEVEL SECURITY;

-- anon からは一切アクセス不可
DROP POLICY IF EXISTS "Deny all for anon" ON admin_failed_attempts;
CREATE POLICY "Deny all for anon" ON admin_failed_attempts
FOR ALL TO anon USING (false);

-- ブルートフォースチェック関数
CREATE OR REPLACE FUNCTION check_admin_brute_force()
RETURNS void AS $$
DECLARE
  recent_failures int;
BEGIN
  SELECT COUNT(*) INTO recent_failures
  FROM admin_failed_attempts
  WHERE attempted_at > NOW() - INTERVAL '15 minutes';
  IF recent_failures >= 5 THEN
    RAISE EXCEPTION 'Too many failed attempts. Please try again later.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 失敗記録関数（古いエントリも削除）
CREATE OR REPLACE FUNCTION record_failed_attempt()
RETURNS void AS $$
BEGIN
  INSERT INTO admin_failed_attempts (attempted_at) VALUES (now());
  DELETE FROM admin_failed_attempts WHERE attempted_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- approve_report にブルートフォース対策を追加
CREATE OR REPLACE FUNCTION approve_report(report_id uuid, password text)
RETURNS void AS $$
DECLARE
  stored_password text;
  report_record resolve_reports%ROWTYPE;
BEGIN
  PERFORM check_admin_brute_force();
  SELECT value INTO stored_password FROM admin_config WHERE key = 'admin_password';
  IF password != stored_password THEN
    PERFORM record_failed_attempt();
    RAISE EXCEPTION 'Invalid password';
  END IF;
  SELECT * INTO report_record FROM resolve_reports WHERE id = approve_report.report_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Report not found';
  END IF;
  UPDATE resolve_reports SET status = 'approved' WHERE id = approve_report.report_id;
  UPDATE posts SET resolved = true, resolved_message = report_record.resolved_message WHERE id = report_record.post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- reject_report にブルートフォース対策を追加
CREATE OR REPLACE FUNCTION reject_report(report_id uuid, password text)
RETURNS void AS $$
DECLARE
  stored_password text;
BEGIN
  PERFORM check_admin_brute_force();
  SELECT value INTO stored_password FROM admin_config WHERE key = 'admin_password';
  IF password != stored_password THEN
    PERFORM record_failed_attempt();
    RAISE EXCEPTION 'Invalid password';
  END IF;
  UPDATE resolve_reports SET status = 'rejected' WHERE id = reject_report.report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
