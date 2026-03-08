-- ═══════════════════════════════════════════════════════════
-- HōMI Database Schema — Migration 00006: Seed Question Bank
-- 42 questions for Home Buying Decision Readiness Assessment
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- FINANCIAL REALITY QUESTIONS (15 questions, 35% weight)
-- ═══════════════════════════════════════════════════════════

-- Q1: Emergency Fund
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_emergency_fund', 'financial', 'liquidity', 'How many months of expenses do you have saved in an emergency fund?', 'single_choice', '[
  {"value": "0", "label": "Less than 1 month", "score": 0},
  {"value": "1", "label": "1-2 months", "score": 15},
  {"value": "3", "label": "3-5 months", "score": 50},
  {"value": "6", "label": "6+ months", "score": 100}
]'::jsonb, 1.0, 1, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q2: Down Payment
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_down_payment', 'financial', 'down_payment', 'What percentage of your target home price do you have saved for a down payment?', 'single_choice', '[
  {"value": "0", "label": "Less than 3%", "score": 0},
  {"value": "3", "label": "3-5%", "score": 30},
  {"value": "10", "label": "6-10%", "score": 60},
  {"value": "20", "label": "11-19%", "score": 85},
  {"value": "20plus", "label": "20% or more", "score": 100}
]'::jsonb, 1.2, 2, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q3: Closing Costs
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_closing_costs', 'financial', 'closing_costs', 'Do you have additional savings set aside for closing costs (typically 2-5% of purchase price)?', 'single_choice', '[
  {"value": "no", "label": "No, I haven\'t considered this", "score": 0},
  {"value": "partial", "label": "I have some but not enough", "score": 40},
  {"value": "yes", "label": "Yes, I have 3-5% saved", "score": 85},
  {"value": "extra", "label": "Yes, with extra cushion", "score": 100}
]'::jsonb, 0.8, 3, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q4: Debt-to-Income Ratio
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_dti_ratio', 'financial', 'debt', 'What is your current debt-to-income ratio (monthly debt payments ÷ gross monthly income)?', 'single_choice', '[
  {"value": "high", "label": "Above 43%", "score": 0},
  {"value": "medium", "label": "36-43%", "score": 40},
  {"value": "good", "label": "28-36%", "score": 75},
  {"value": "excellent", "label": "Below 28%", "score": 100}
]'::jsonb, 1.0, 4, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q5: Credit Score
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_credit_score', 'financial', 'credit', 'What is your current credit score range?', 'single_choice', '[
  {"value": "poor", "label": "Below 580", "score": 0},
  {"value": "fair", "label": "580-669", "score": 35},
  {"value": "good", "label": "670-739", "score": 70},
  {"value": "very_good", "label": "740-799", "score": 90},
  {"value": "excellent", "label": "800+", "score": 100}
]'::jsonb, 0.9, 5, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q6: Stable Income
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_income_stability', 'financial', 'income', 'How stable is your current income?', 'single_choice', '[
  {"value": "unstable", "label": "Variable/unpredictable income", "score": 15},
  {"value": "new", "label": "New job (< 6 months)", "score": 35},
  {"value": "stable", "label": "Stable for 6-24 months", "score": 70},
  {"value": "very_stable", "label": "Very stable (2+ years)", "score": 100}
]'::jsonb, 1.1, 6, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q7: Post-Purchase Savings
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_post_purchase', 'financial', 'reserves', 'After purchasing, how many months of mortgage payments will you have in reserve?', 'single_choice', '[
  {"value": "0", "label": "None", "score": 0},
  {"value": "1", "label": "1 month", "score": 20},
  {"value": "3", "label": "2-3 months", "score": 50},
  {"value": "6", "label": "4-6 months", "score": 80},
  {"value": "6plus", "label": "6+ months", "score": 100}
]'::jsonb, 0.9, 7, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q8: Monthly Housing Budget
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_housing_budget', 'financial', 'affordability', 'What percentage of your gross monthly income are you comfortable spending on housing?', 'single_choice', '[
  {"value": "high", "label": "More than 36%", "score": 10},
  {"value": "medium", "label": "31-36%", "score": 50},
  {"value": "recommended", "label": "25-30%", "score": 85},
  {"value": "conservative", "label": "Less than 25%", "score": 100}
]'::jsonb, 1.0, 8, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q9: Home Maintenance Fund
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_maintenance_fund', 'financial', 'maintenance', 'Do you have a plan for ongoing home maintenance (typically 1-3% of home value annually)?', 'single_choice', '[
  {"value": "no", "label": "No plan", "score": 10},
  {"value": "vague", "label": "Vague idea", "score": 35},
  {"value": "budgeted", "label": "Budgeted monthly savings", "score": 75},
  {"value": "dedicated", "label": "Dedicated maintenance fund", "score": 100}
]'::jsonb, 0.7, 9, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q10: Job Security
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_job_security', 'financial', 'income', 'How would you rate your job security over the next 2-3 years?', 'slider', NULL, 0.8, 10, ARRAY['home_buying'], true, '{"type": "scaled", "params": {"min": 0, "max": 100}}'::jsonb);

-- Q11: Other Major Expenses
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_other_expenses', 'financial', 'planning', 'Do you have any major expenses coming up in the next 1-2 years?', 'multi_choice', '[
  {"value": "wedding", "label": "Wedding", "score": -10},
  {"value": "baby", "label": "Having a baby", "score": -15},
  {"value": "car", "label": "New car purchase", "score": -10},
  {"value": "education", "label": "Education costs", "score": -10},
  {"value": "none", "label": "No major expenses planned", "score": 0}
]'::jsonb, 0.6, 11, ARRAY['home_buying'], true, '{"type": "multi_select", "params": {"base_score": 100, "penalty_per_item": 10}}'::jsonb);

-- Q12: Retirement Savings
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_retirement', 'financial', 'long_term', 'Are you currently contributing to retirement savings?', 'single_choice', '[
  {"value": "no", "label": "Not contributing", "score": 20},
  {"value": "some", "label": "Contributing some", "score": 60},
  {"value": "match", "label": "Contributing to get full employer match", "score": 85},
  {"value": "max", "label": "Maxing out contributions", "score": 100}
]'::jsonb, 0.7, 12, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q13: Additional Income Sources
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_income_sources', 'financial', 'income', 'Do you have additional income sources beyond your primary job?', 'multi_choice', '[
  {"value": "spouse", "label": "Spouse/partner income", "score": 15},
  {"value": "investments", "label": "Investment income", "score": 10},
  {"value": "side", "label": "Side business/freelance", "score": 10},
  {"value": "rental", "label": "Rental income", "score": 15},
  {"value": "none", "label": "No additional sources", "score": 0}
]'::jsonb, 0.5, 13, ARRAY['home_buying'], true, '{"type": "multi_select", "params": {"base_score": 70, "bonus_per_item": 10}}'::jsonb);

-- Q14: Mortgage Pre-approval
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_preapproval', 'financial', 'preparation', 'Have you been pre-approved for a mortgage?', 'single_choice', '[
  {"value": "no", "label": "No", "score": 30},
  {"value": "started", "label": "Started the process", "score": 60},
  {"value": "yes", "label": "Yes, pre-approved", "score": 100}
]'::jsonb, 0.8, 14, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q15: Financial Stress
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('fin_stress_level', 'financial', 'readiness', 'How stressed would you feel about adding a mortgage payment to your current finances?', 'slider', NULL, 0.9, 15, ARRAY['home_buying'], true, '{"type": "inverted", "params": {"min": 0, "max": 100}}'::jsonb);

-- ═══════════════════════════════════════════════════════════
-- EMOTIONAL TRUTH QUESTIONS (15 questions, 35% weight)
-- ═══════════════════════════════════════════════════════════

-- Q16: Decision Motivation
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_motivation', 'emotional', 'motivation', 'What is your primary motivation for buying a home right now?', 'single_choice', '[
  {"value": "pressure", "label": "External pressure (family, friends, society)", "score": 20},
  {"value": "fomo", "label": "Fear of missing out on market", "score": 30},
  {"value": "rent", "label": "Tired of renting", "score": 60},
  {"value": "stability", "label": "Desire for stability and roots", "score": 85},
  {"value": "ready", "label": "I feel genuinely ready", "score": 100}
]'::jsonb, 1.1, 16, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q17: Timeline Pressure
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_timeline_pressure', 'emotional', 'pressure', 'Do you feel pressure to buy within a specific timeframe?', 'single_choice', '[
  {"value": "urgent", "label": "Yes, very urgent (within months)", "score": 25},
  {"value": "some", "label": "Some pressure (within a year)", "score": 55},
  {"value": "flexible", "label": "Flexible timeline", "score": 85},
  {"value": "no", "label": "No pressure at all", "score": 100}
]'::jsonb, 0.9, 17, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q18: Fear of Regret
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_fear_regret', 'emotional', 'anxiety', 'How much do you worry about making the wrong decision?', 'slider', NULL, 0.8, 18, ARRAY['home_buying'], true, '{"type": "scaled", "params": {"min": 0, "max": 100, "optimal": 50}}'::jsonb);

-- Q19: Partner Alignment
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_partner_alignment', 'emotional', 'relationship', 'If buying with a partner, how aligned are you on this decision?', 'single_choice', '[
  {"value": "solo", "label": "Buying solo", "score": 100},
  {"value": "disagree", "label": "We disagree significantly", "score": 10},
  {"value": "some", "label": "Some differences to work out", "score": 50},
  {"value": "aligned", "label": "Mostly aligned", "score": 85},
  {"value": "fully", "label": "Fully aligned", "score": 100}
]'::jsonb, 1.0, 19, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q20: Lifestyle Impact
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_lifestyle_impact', 'emotional', 'lifestyle', 'Have you thought about how homeownership will change your lifestyle?', 'single_choice', '[
  {"value": "no", "label": "Haven\'t really considered it", "score": 25},
  {"value": "vague", "label": "Vague idea", "score": 50},
  {"value": "thought", "label": "Thought it through", "score": 80},
  {"value": "detailed", "label": "Detailed planning", "score": 100}
]'::jsonb, 0.8, 20, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q21: Home Attachment
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_attachment', 'emotional', 'expectations', 'How emotionally attached are you to the idea of owning a home?', 'slider', NULL, 0.7, 21, ARRAY['home_buying'], true, '{"type": "scaled", "params": {"min": 0, "max": 100, "optimal": 70}}'::jsonb);

-- Q22: Flexibility Loss
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_flexibility', 'emotional', 'tradeoffs', 'How do you feel about losing the flexibility to move easily?', 'single_choice', '[
  {"value": "concerned", "label": "Very concerned", "score": 60},
  {"value": "some", "label": "Somewhat concerned", "score": 80},
  {"value": "accept", "label": "Acceptable trade-off", "score": 95},
  {"value": "want", "label": "I want to put down roots", "score": 100}
]'::jsonb, 0.7, 22, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q23: Decision Confidence
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_confidence', 'emotional', 'confidence', 'How confident do you feel in your ability to make this decision?', 'slider', NULL, 1.0, 23, ARRAY['home_buying'], true, '{"type": "direct", "params": {"min": 0, "max": 100}}'::jsonb);

-- Q24: Research Level
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_research', 'emotional', 'preparation', 'How much research have you done on the home buying process?', 'single_choice', '[
  {"value": "none", "label": "Very little", "score": 20},
  {"value": "some", "label": "Some reading", "score": 50},
  {"value": "good", "label": "Good amount", "score": 80},
  {"value": "extensive", "label": "Extensive research", "score": 100}
]'::jsonb, 0.8, 24, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q25: Support System
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_support', 'emotional', 'support', 'Do you have a support system to help with this decision?', 'multi_choice', '[
  {"value": "family", "label": "Family support", "score": 10},
  {"value": "friends", "label": "Friends who\'ve bought homes", "score": 10},
  {"value": "agent", "label": "Real estate agent", "score": 10},
  {"value": "advisor", "label": "Financial advisor", "score": 15},
  {"value": "none", "label": "No support system", "score": 0}
]'::jsonb, 0.6, 25, ARRAY['home_buying'], true, '{"type": "multi_select", "params": {"base_score": 60, "bonus_per_item": 10}}'::jsonb);

-- Q26: Sleep Factor
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_sleep_factor', 'emotional', 'anxiety', 'How does thinking about buying a home affect your sleep?', 'single_choice', '[
  {"value": "severe", "label": "Lose sleep frequently", "score": 20},
  {"value": "sometimes", "label": "Sometimes worried", "score": 50},
  {"value": "rarely", "label": "Rarely affects sleep", "score": 80},
  {"value": "never", "label": "Never affects sleep", "score": 100}
]'::jsonb, 0.8, 26, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q27: Identity Connection
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_identity', 'emotional', 'identity', 'How much is homeownership tied to your sense of success/identity?', 'slider', NULL, 0.6, 27, ARRAY['home_buying'], true, '{"type": "scaled", "params": {"min": 0, "max": 100, "optimal": 50}}'::jsonb);

-- Q28: Market Timing Anxiety
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_market_anxiety', 'emotional', 'anxiety', 'How anxious are you about market timing (prices, interest rates)?', 'slider', NULL, 0.7, 28, ARRAY['home_buying'], true, '{"type": "inverted", "params": {"min": 0, "max": 100}}'::jsonb);

-- Q29: Long-term Vision
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_long_term', 'emotional', 'vision', 'Can you see yourself living in the same home 5-10 years from now?', 'single_choice', '[
  {"value": "no", "label": "Definitely not", "score": 30},
  {"value": "unsure", "label": "Unsure", "score": 55},
  {"value": "maybe", "label": "Probably", "score": 80},
  {"value": "yes", "label": "Definitely yes", "score": 100}
]'::jsonb, 0.9, 29, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q30: Gut Feeling
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('emo_gut_feeling', 'emotional', 'intuition', 'What does your gut tell you about buying a home right now?', 'single_choice', '[
  {"value": "wrong", "label": "Something feels wrong", "score": 25},
  {"value": "unsure", "label": "Uncertain/confused", "score": 50},
  {"value": "curious", "label": "Curious but cautious", "score": 75},
  {"value": "right", "label": "Feels like the right time", "score": 100}
]'::jsonb, 1.0, 30, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- ═══════════════════════════════════════════════════════════
-- PERFECT TIMING QUESTIONS (12 questions, 30% weight)
-- ═══════════════════════════════════════════════════════════

-- Q31: Market Conditions
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('time_market', 'timing', 'market', 'How would you describe current market conditions in your area?', 'single_choice', '[
  {"value": "hot", "label": "Very hot (bidding wars, fast sales)", "score": 40},
  {"value": "warm", "label": "Warm (moving quickly)", "score": 65},
  {"value": "balanced", "label": "Balanced", "score": 90},
  {"value": "cool", "label": "Cool/Buyer\'s market", "score": 100}
]'::jsonb, 0.9, 31, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q32: Interest Rate Environment
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('time_interest_rates', 'timing', 'rates', 'How do current interest rates affect your decision?', 'single_choice', '[
  {"value": "blocker", "label": "Rates are too high for my budget", "score": 20},
  {"value": "concern", "label": "Concerned but manageable", "score": 55},
  {"value": "acceptable", "label": "Acceptable for my situation", "score": 85},
  {"value": "good", "label": "Good/locked in a good rate", "score": 100}
]'::jsonb, 1.0, 32, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q33: Personal Timeline
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('time_personal', 'timing', 'life_stage', 'Where are you in your personal life timeline?', 'single_choice', '[
  {"value": "chaos", "label": "Major life changes happening", "score": 30},
  {"value": "settling", "label": "Just settling into stability", "score": 60},
  {"value": "stable", "label": "Stable for 6+ months", "score": 85},
  {"value": "rooted", "label": "Ready to put down roots", "score": 100}
]'::jsonb, 1.1, 33, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q34: Seasonal Timing
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('time_seasonal', 'timing', 'season', 'What season are you planning to buy?', 'single_choice', '[
  {"value": "winter", "label": "Winter (fewer buyers, better deals)", "score": 95},
  {"value": "spring", "label": "Spring (more inventory, more competition)", "score": 70},
  {"value": "summer", "label": "Summer (active market)", "score": 65},
  {"value": "fall", "label": "Fall (good balance)", "score": 85}
]'::jsonb, 0.5, 34, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q35: Inventory Levels
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('time_inventory', 'timing', 'market', 'How would you describe housing inventory in your target area?', 'single_choice', '[
  {"value": "very_low", "label": "Very low (hard to find options)", "score": 35},
  {"value": "low", "label": "Low", "score": 60},
  {"value": "moderate", "label": "Moderate", "score": 85},
  {"value": "high", "label": "High (lots of options)", "score": 100}
]'::jsonb, 0.7, 35, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q36: Work Stability
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('time_work_stability', 'timing', 'career', 'How stable is your work situation for the next 2-3 years?', 'single_choice', '[
  {"value": "uncertain", "label": "Uncertain/changing", "score": 30},
  {"value": "new", "label": "New job/role", "score": 55},
  {"value": "stable", "label": "Stable", "score": 85},
  {"value": "very_stable", "label": "Very stable", "score": 100}
]'::jsonb, 1.0, 36, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q37: Local Knowledge
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('time_local_knowledge', 'timing', 'preparation', 'How well do you know the neighborhoods you're considering?', 'single_choice', '[
  {"value": "none", "label": "Not at all", "score": 25},
  {"value": "some", "label": "Some research online", "score": 55},
  {"value": "visited", "label": "Visited multiple times", "score": 80},
  {"value": "expert", "label": "Very familiar/lived nearby", "score": 100}
]'::jsonb, 0.8, 37, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q38: Life Events
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('time_life_events', 'timing', 'life_stage', 'Are there any major life events happening in the next 6 months?', 'multi_choice', '[
  {"value": "wedding", "label": "Wedding", "score": -10},
  {"value": "baby", "label": "New baby", "score": -15},
  {"value": "job_change", "label": "Job change", "score": -15},
  {"value": "move", "label": "Relocation", "score": -10},
  {"value": "none", "label": "No major events", "score": 0}
]'::jsonb, 0.8, 38, ARRAY['home_buying'], true, '{"type": "multi_select", "params": {"base_score": 100, "penalty_per_item": 15}}'::jsonb);

-- Q39: Market Forecast
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('time_forecast', 'timing', 'market', 'Based on your research, where do you think the market is headed?', 'single_choice', '[
  {"value": "up", "label": "Prices will rise (buy now)", "score": 70},
  {"value": "down", "label": "Prices will fall (wait)", "score": 50},
  {"value": "stable", "label": "Stay relatively stable", "score": 90},
  {"value": "unsure", "label": "Uncertain/can\'t predict", "score": 75}
]'::jsonb, 0.6, 39, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q40: Readiness Timeline
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('time_readiness', 'timing', 'readiness', 'When do you realistically expect to be ready to buy?', 'single_choice', '[
  {"value": "now", "label": "Ready now", "score": 100},
  {"value": "3mo", "label": "Within 3 months", "score": 90},
  {"value": "6mo", "label": "3-6 months", "score": 75},
  {"value": "1yr", "label": "6-12 months", "score": 55},
  {"value": "later", "label": "More than a year", "score": 35}
]'::jsonb, 1.0, 40, ARRAY['home_buying'], true, '{"type": "lookup", "params": {}}'::jsonb);

-- Q41: Professional Team
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('time_professional_team', 'timing', 'preparation', 'Do you have your professional team in place?', 'multi_choice', '[
  {"value": "agent", "label": "Real estate agent", "score": 10},
  {"value": "lender", "label": "Mortgage lender/pre-approval", "score": 15},
  {"value": "inspector", "label": "Home inspector referral", "score": 5},
  {"value": "attorney", "label": "Real estate attorney", "score": 5},
  {"value": "none", "label": "No team yet", "score": 0}
]'::jsonb, 0.7, 41, ARRAY['home_buying'], true, '{"type": "multi_select", "params": {"base_score": 70, "bonus_per_item": 10}}'::jsonb);

-- Q42: Overall Timing Confidence
INSERT INTO question_bank (id, dimension, category, question_text, question_type, options, weight, order_index, decision_types, active, scoring_function) VALUES
('time_overall', 'timing', 'readiness', 'Overall, how confident are you that NOW is a good time for YOU to buy?', 'slider', NULL, 1.2, 42, ARRAY['home_buying'], true, '{"type": "direct", "params": {"min": 0, "max": 100}}'::jsonb);
