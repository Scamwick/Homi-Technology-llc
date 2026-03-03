import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateApiKey, PREMIUM_PARTNER_PERMISSIONS } from '@/lib/partners/api-keys'
import { z } from 'zod'

const createPartnerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  website: z.string().url().optional(),
  companyName: z.string().optional(),
  webhookUrl: z.string().url().optional(),
})

// GET /api/partners - List partners (admin only)
export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: partners, error } = await supabase
      .from('partners')
      .select('*, api_keys(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching partners:', error)
      return NextResponse.json(
        { error: 'Failed to fetch partners' },
        { status: 500 }
      )
    }

    return NextResponse.json({ partners })
  } catch (error) {
    console.error('Error in GET /api/partners:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/partners - Create a new partner (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createPartnerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, email, website, companyName, webhookUrl } = validation.data

    // Create partner
    const { data: partner, error: createError } = await supabase
      .from('partners')
      .insert({
        name,
        email,
        website,
        branding: {
          companyName: companyName || name,
          logoUrl: null,
          primaryColor: null,
        },
        webhook_url: webhookUrl,
        status: 'active',
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating partner:', createError)
      return NextResponse.json(
        { error: 'Failed to create partner' },
        { status: 500 }
      )
    }

    // Generate API key
    const { rawKey, keyHash, keyPrefix } = generateApiKey()

    const { error: keyError } = await supabase
      .from('partner_api_keys')
      .insert({
        partner_id: partner.id,
        name: 'Default API Key',
        key_hash: keyHash,
        key_prefix: keyPrefix,
        permissions: PREMIUM_PARTNER_PERMISSIONS,
        rate_limit: 1000,
        is_active: true,
      })

    if (keyError) {
      console.error('Error creating API key:', keyError)
    }

    return NextResponse.json({ 
      partner,
      apiKey: rawKey, // Only shown once
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/partners:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
