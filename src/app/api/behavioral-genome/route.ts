import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { analyzeBehavioralGenome } from '@/lib/behavioral-genome/engine'

// GET /api/behavioral-genome - Get user's behavioral genome
export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's assessment history
    const { data: assessments, error: assessmentsError } = await (supabase as any)
      .from('assessments')
      .select('*, responses(*)')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: true })

    if (assessmentsError) {
      console.error('Error fetching assessments:', assessmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch assessments' },
        { status: 500 }
      )
    }

    // Analyze behavioral genome
    const genome = analyzeBehavioralGenome(assessments || [])
    genome.userId = user.id

    // Store or update genome in database
    const { error: upsertError } = await (supabase as any)
      .from('behavioral_genomes')
      .upsert({
        user_id: user.id,
        traits: genome.traits,
        patterns: genome.patterns,
        archetype: genome.archetype,
        archetype_description: genome.archetypeDescription,
        insights: genome.insights,
        recommendations: genome.recommendations,
        last_updated: genome.lastUpdated,
      }, {
        onConflict: 'user_id',
      })

    if (upsertError) {
      console.error('Error storing genome:', upsertError)
    }

    return NextResponse.json({ genome })
  } catch (error) {
    console.error('Error in GET /api/behavioral-genome:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
