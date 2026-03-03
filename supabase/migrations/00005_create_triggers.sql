-- ═══════════════════════════════════════════════════════════
-- HōMI Database Schema — Migration 00005: Triggers
-- ═══════════════════════════════════════════════════════════

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update profiles.updated_at on update
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update advisor_conversations.updated_at on update
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON advisor_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════
-- PROFILE CREATION TRIGGER (on auth.users insert)
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    subscription_tier,
    subscription_status,
    onboarding_completed,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'free',
    'active',
    false,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- ASSESSMENT COMPLETION TRIGGER
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_assessment_completed()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Set completed_at timestamp
    NEW.completed_at = NOW();
    
    -- Create notification for user
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      data,
      action_url
    ) VALUES (
      NEW.user_id,
      'assessment_complete',
      'Assessment Complete',
      'Your assessment is ready. View your results now.',
      jsonb_build_object('assessment_id', NEW.id, 'verdict', NEW.verdict),
      '/assessments/' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_assessment_completed
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION handle_assessment_completed();

-- ═══════════════════════════════════════════════════════════
-- COUPLE ACTIVATION TRIGGER (when partner_b accepts)
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_couple_activated()
RETURNS TRIGGER AS $$
BEGIN
  -- If partner_b_id was just set, activate the couple
  IF NEW.partner_b_id IS NOT NULL AND OLD.partner_b_id IS NULL THEN
    NEW.status = 'active';
    
    -- Notify partner_a
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      action_url
    ) VALUES (
      NEW.partner_a_id,
      'couple_invite',
      'Partner Joined!',
      'Your partner has accepted your invitation.',
      '/couples'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_couple_activated
  BEFORE UPDATE ON couples
  FOR EACH ROW
  EXECUTE FUNCTION handle_couple_activated();

-- ═══════════════════════════════════════════════════════════
-- TRANSFORMATION MILESTONE TRIGGER
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_milestone_achieved()
RETURNS TRIGGER AS $$
DECLARE
  milestone jsonb;
  achieved_count integer;
BEGIN
  -- Count newly achieved milestones
  SELECT COUNT(*)
  INTO achieved_count
  FROM jsonb_array_elements(NEW.milestones) AS m
  WHERE (m->>'achieved')::boolean = true
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(OLD.milestones) AS old_m
    WHERE (old_m->>'id') = (m->>'id')
    AND (old_m->>'achieved')::boolean = true
  );
  
  -- If any milestones were just achieved, notify user
  IF achieved_count > 0 THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      action_url
    )
    SELECT 
      NEW.user_id,
      'transformation_milestone',
      'Milestone Achieved!',
      'You\'ve reached a milestone on your transformation path.',
      '/transformation'
    WHERE achieved_count > 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_milestone_achieved
  BEFORE UPDATE ON transformation_paths
  FOR EACH ROW
  EXECUTE FUNCTION handle_milestone_achieved();

-- ═══════════════════════════════════════════════════════════
-- EXPIRED ASSESSMENTS CLEANUP (run via cron)
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION expire_old_assessments()
RETURNS void AS $$
BEGIN
  UPDATE assessments
  SET status = 'expired'
  WHERE status = 'in_progress'
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════
-- NOTIFICATION CLEANUP TRIGGER (keep max 200 per user)
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete oldest notifications if user has more than 200
  DELETE FROM notifications
  WHERE id IN (
    SELECT id FROM notifications
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    OFFSET 200
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_notification_inserted
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_notifications();
