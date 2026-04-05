-- ============================================================================
-- HoMI Technologies LLC - Decision Readiness Intelligence Platform
-- Migration 00009: Organizations (Family & Enterprise)
-- ============================================================================
-- Adds the organizations and organization_members tables for family
-- (multi-member household) and enterprise (B2B team) features.
-- Referenced by calendar_shares for org-level sharing.
-- Depends on: 00002_create_tables.sql (profiles)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. organizations
-- ---------------------------------------------------------------------------

CREATE TABLE organizations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            text NOT NULL,
    owner_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tier            subscription_tier NOT NULL DEFAULT 'family',
    org_type        text NOT NULL DEFAULT 'family'
                    CHECK (org_type IN ('family', 'enterprise')),
    max_members     integer NOT NULL DEFAULT 6,
    settings        jsonb DEFAULT '{}'::jsonb,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE organizations IS 'Family households and enterprise teams for shared readiness features';
COMMENT ON COLUMN organizations.org_type IS 'family = household sharing, enterprise = B2B team';
COMMENT ON COLUMN organizations.max_members IS 'Maximum members allowed (6 for family, configurable for enterprise)';

-- ---------------------------------------------------------------------------
-- 2. organization_members
-- ---------------------------------------------------------------------------

CREATE TABLE organization_members (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE,
    role            text NOT NULL DEFAULT 'member'
                    CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    invite_email    text,
    invite_token    text UNIQUE,
    accepted        boolean NOT NULL DEFAULT false,
    invited_by      uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    -- Either user_id or invite_email must be set
    CONSTRAINT chk_member_identity CHECK (
        user_id IS NOT NULL OR invite_email IS NOT NULL
    )
);

COMMENT ON TABLE organization_members IS 'Members of family/enterprise organizations with role-based access';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_org_members_token ON organization_members(invite_token) WHERE invite_token IS NOT NULL;
CREATE UNIQUE INDEX idx_org_members_unique ON organization_members(organization_id, user_id) WHERE user_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- RLS Policies
-- ---------------------------------------------------------------------------

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Org owners and members can view their organization
CREATE POLICY organizations_view ON organizations
    FOR SELECT USING (
        auth.uid() = owner_id
        OR EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_id = organizations.id
            AND user_id = auth.uid()
            AND accepted = true
        )
    );

-- Only owners can modify organizations
CREATE POLICY organizations_modify ON organizations
    FOR ALL USING (auth.uid() = owner_id);

-- Members can view their own membership
CREATE POLICY org_members_view ON organization_members
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM organizations
            WHERE id = organization_members.organization_id
            AND owner_id = auth.uid()
        )
    );

-- Org owners can manage members
CREATE POLICY org_members_manage ON organization_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organizations
            WHERE id = organization_members.organization_id
            AND owner_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

CREATE TRIGGER set_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER set_org_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);
