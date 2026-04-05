'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Heart,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { Button, Slider, Card } from '@/components/ui';
import { ThresholdCompass, BrandedName } from '@/components/brand';
import { useAssessmentFlow } from '@/hooks/useAssessmentFlow';
import type {
  Question,
  Dimension,
  ChoiceOption,
  SliderConfig,
  ResponseValue,
} from '@/lib/questions/bank';

// =============================================================================
// Constants & Config
// =============================================================================

const DIMENSION_META: Record<
  Dimension,
  {
    label: string;
    icon: typeof Shield;
    color: string;
    colorRgb: string;
    colorVar: string;
    sliderColor: 'cyan' | 'emerald' | 'yellow';
    subtitle: string;
    transitionText: string;
  }
> = {
  financial: {
    label: 'Financial Reality',
    icon: Shield,
    color: '#22d3ee',
    colorRgb: '34, 211, 238',
    colorVar: 'var(--cyan)',
    sliderColor: 'cyan',
    subtitle: 'Understanding your financial foundation',
    transitionText: "Let\u2019s look at where you stand financially...",
  },
  emotional: {
    label: 'Emotional Truth',
    icon: Heart,
    color: '#34d399',
    colorRgb: '52, 211, 153',
    colorVar: 'var(--emerald)',
    sliderColor: 'emerald',
    subtitle: 'Be honest with yourself \u2014 no wrong answers',
    transitionText: "Now let\u2019s explore your emotional readiness...",
  },
  timing: {
    label: 'Perfect Timing',
    icon: Clock,
    color: '#facc15',
    colorRgb: '250, 204, 21',
    colorVar: 'var(--yellow)',
    sliderColor: 'yellow',
    subtitle: "Timing isn\u2019t everything, but it matters",
    transitionText: "Finally, let\u2019s check if the timing is right...",
  },
};

const SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.96,
  }),
};

// =============================================================================
// CurrencyInput — inline number field for $ amounts
// =============================================================================

function CurrencyInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | string | undefined;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  const numVal = typeof value === 'number' ? value : 0;
  const [display, setDisplay] = useState(
    numVal > 0 ? numVal.toLocaleString('en-US') : '',
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      const num = raw ? parseInt(raw, 10) : 0;
      setDisplay(raw ? num.toLocaleString('en-US') : '');
      onChange(num);
    },
    [onChange],
  );

  return (
    <div className="relative w-full max-w-xs mx-auto">
      <div
        className="absolute left-4 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--text-secondary)' }}
      >
        <DollarSign size={20} />
      </div>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder ?? '0'}
        className="w-full h-14 pl-12 pr-4 text-xl font-semibold rounded-xl outline-none transition-all duration-200 focus:ring-2"
        style={{
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          color: 'var(--text-primary)',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--tw-ring-color' as any]: 'var(--cyan)',
        }}
      />
    </div>
  );
}

// =============================================================================
// ChoiceCards — 2-col grid for single_choice questions
// =============================================================================

function ChoiceCards({
  options,
  value,
  onChange,
  dimensionColor,
  dimensionColorRgb,
}: {
  options: ChoiceOption[];
  value: string | undefined;
  onChange: (v: string) => void;
  dimensionColor: string;
  dimensionColorRgb: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mx-auto">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="relative flex items-start gap-3 px-4 py-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border text-left"
            style={{
              background: isSelected
                ? `rgba(${dimensionColorRgb}, 0.12)`
                : 'rgba(30, 41, 59, 0.6)',
              borderColor: isSelected
                ? dimensionColor
                : 'rgba(51, 65, 85, 0.5)',
              color: isSelected ? dimensionColor : 'var(--text-secondary)',
            }}
          >
            <div
              className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full mt-0.5 transition-all duration-200"
              style={{
                border: `2px solid ${isSelected ? dimensionColor : 'rgba(51, 65, 85, 0.8)'}`,
                background: isSelected ? dimensionColor : 'transparent',
              }}
            >
              {isSelected && (
                <Check size={12} style={{ color: '#0a1628' }} strokeWidth={3} />
              )}
            </div>
            <span className="leading-snug">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// DimensionSlider — wrapper over Slider for dimension questions
// =============================================================================

function DimensionSlider({
  config,
  value,
  onChange,
  sliderColor,
}: {
  config: SliderConfig;
  value: number;
  onChange: (v: number) => void;
  sliderColor: 'cyan' | 'emerald' | 'yellow';
}) {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-2">
      <Slider
        min={config.min}
        max={config.max}
        step={1}
        value={value}
        onChange={onChange}
        color={sliderColor}
        showValue
      />
      <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>{config.min_label}</span>
        <span>{config.max_label}</span>
      </div>
    </div>
  );
}

// =============================================================================
// ProgressBar — Three-segment dimension progress
// =============================================================================

function TriSegmentProgress({
  financialFraction,
  emotionalFraction,
  timingFraction,
  currentDimension,
}: {
  financialFraction: number;
  emotionalFraction: number;
  timingFraction: number;
  currentDimension: Dimension;
}) {
  const segments: { dim: Dimension; fraction: number; color: string }[] = [
    { dim: 'financial', fraction: financialFraction, color: '#22d3ee' },
    { dim: 'emotional', fraction: emotionalFraction, color: '#34d399' },
    { dim: 'timing', fraction: timingFraction, color: '#facc15' },
  ];

  return (
    <div className="flex gap-1.5 w-full">
      {segments.map(({ dim, fraction, color }) => (
        <div
          key={dim}
          className="flex-1 h-1.5 rounded-full overflow-hidden relative"
          style={{
            background: 'rgba(51, 65, 85, 0.5)',
            boxShadow:
              dim === currentDimension
                ? `0 0 8px rgba(${DIMENSION_META[dim].colorRgb}, 0.3)`
                : undefined,
          }}
        >
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(fraction * 100, 100)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' as const }}
          />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// DimensionTransition — full-screen overlay between dimension changes
// =============================================================================

function DimensionTransition({
  dimension,
  onComplete,
}: {
  dimension: Dimension;
  onComplete: () => void;
}) {
  const meta = DIMENSION_META[dimension];
  const Icon = meta.icon;

  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#0a1628' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Color wash */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, rgba(${meta.colorRgb}, 0.15) 0%, transparent 70%)`,
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' as const }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div
          className="flex items-center justify-center w-20 h-20 rounded-full"
          style={{
            background: `rgba(${meta.colorRgb}, 0.15)`,
            boxShadow: `0 0 40px rgba(${meta.colorRgb}, 0.2)`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <Icon size={36} style={{ color: meta.color }} />
        </motion.div>

        <motion.h2
          className="text-2xl font-bold text-center"
          style={{ color: meta.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {meta.label}
        </motion.h2>

        <motion.p
          className="text-base text-center max-w-sm px-4"
          style={{ color: 'var(--text-secondary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {meta.transitionText}
        </motion.p>

        {/* Loading dots */}
        <motion.div
          className="flex gap-2 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: meta.color }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut' as const,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// ProcessingState — full-screen submit animation
// =============================================================================

function ProcessingState() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#0a1628' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Radial glow behind compass */}
      <div
        className="absolute"
        style={{
          width: 500,
          height: 500,
          background:
            'radial-gradient(circle, rgba(34,211,238,0.08) 0%, rgba(52,211,153,0.05) 40%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, type: 'spring', stiffness: 100 }}
      >
        <ThresholdCompass size={300} animate />
      </motion.div>

      <motion.p
        className="mt-10 text-lg font-semibold text-center max-w-sm px-4"
        style={{ color: 'var(--text-primary)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Calculating your <BrandedName />-Score...
      </motion.p>

      <motion.p
        className="mt-2 text-sm text-center"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Analyzing readiness across three dimensions
      </motion.p>

      {/* Pulsing dots */}
      <motion.div
        className="flex gap-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--cyan)' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut' as const,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// LiveScorePreview — mini compass in bottom-right corner
// =============================================================================

function LiveScorePreview({
  financial,
  emotional,
  timing,
}: {
  financial: number;
  emotional: number;
  timing: number;
}) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40"
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.4 }}
    >
      <div
        className="relative flex items-center justify-center rounded-full p-2"
        style={{
          background: 'rgba(10, 22, 40, 0.9)',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <ThresholdCompass
          size={56}
          financial={financial}
          emotional={emotional}
          timing={timing}
          animate
          showKeyhole={false}
        />
      </div>
    </motion.div>
  );
}

// =============================================================================
// QuestionScreen — renders a single question in the center of the screen
// =============================================================================

function QuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  currentResponse,
  onResponse,
}: {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  currentResponse: ResponseValue | undefined;
  onResponse: (value: ResponseValue) => void;
}) {
  const meta = DIMENSION_META[question.dimension];
  const Icon = meta.icon;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Dimension badge */}
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
        style={{
          background: `rgba(${meta.colorRgb}, 0.12)`,
          color: meta.color,
          border: `1px solid rgba(${meta.colorRgb}, 0.25)`,
        }}
      >
        <Icon size={14} />
        {meta.label}
      </div>

      {/* Question counter */}
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Question {questionNumber} of {totalQuestions}
      </p>

      {/* Question card */}
      <Card padding="lg" className="w-full max-w-xl text-center">
        {/* Question text */}
        <h2
          className="text-xl font-semibold leading-relaxed mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {question.question_text}
        </h2>

        {/* Subtitle hint */}
        {question.category && (
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            {meta.subtitle}
          </p>
        )}

        {/* Input control */}
        <div className="mt-4">
          {question.question_type === 'slider' && question.options && (
            <DimensionSlider
              config={question.options as SliderConfig}
              value={typeof currentResponse === 'number' ? currentResponse : (question.options as SliderConfig).min}
              onChange={(v) => onResponse(v)}
              sliderColor={meta.sliderColor}
            />
          )}

          {question.question_type === 'single_choice' && question.options && (
            <ChoiceCards
              options={question.options as ChoiceOption[]}
              value={typeof currentResponse === 'string' ? currentResponse : undefined}
              onChange={(v) => onResponse(v)}
              dimensionColor={meta.color}
              dimensionColorRgb={meta.colorRgb}
            />
          )}

          {question.question_type === 'number' && (
            <CurrencyInput
              value={currentResponse}
              onChange={(v) => onResponse(v)}
              placeholder="Enter amount"
            />
          )}
        </div>
      </Card>
    </div>
  );
}

// =============================================================================
// Main Page
// =============================================================================

export default function NewAssessmentPage() {
  const router = useRouter();
  const currentStep = useAssessmentStore((s) => s.currentStep);
  const nextStep = useAssessmentStore((s) => s.nextStep);
  const prevStep = useAssessmentStore((s) => s.prevStep);
  const goToStep = useAssessmentStore((s) => s.goToStep);
  const submit = useAssessmentStore((s) => s.submit);
  const submitting = useAssessmentStore((s) => s.submitting);
  const error = useAssessmentStore((s) => s.error);
  const financial = useAssessmentStore((s) => s.financial);

  const setVerifiedOverrides = useAssessmentStore((s) => s.setVerifiedOverrides);
  const setFinancial = useAssessmentStore((s) => s.setFinancial);

  const [direction, setDirection] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionDimension, setTransitionDimension] = useState<Dimension>('financial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const prevDimensionRef = useRef<Dimension>('financial');

  // The question flow hook drives everything
  const flow = useAssessmentFlow('home_buying');
  const {
    currentQuestion,
    progress,
    submitResponse,
    goBack,
    canGoBack,
    isComplete,
    isPastEnd,
    getResponse,
    assessmentScore,
    responses,
  } = flow;

  // Pending response for the current question (not yet submitted to the flow)
  const [pendingResponse, setPendingResponse] = useState<ResponseValue | undefined>(undefined);

  // Sync pendingResponse when question changes
  useEffect(() => {
    if (currentQuestion) {
      const existing = getResponse(currentQuestion.id);
      setPendingResponse(existing);
    }
  }, [currentStep, goToStep]);

  // Pre-fill from Plaid-verified data when available
  useEffect(() => {
    let cancelled = false;
    async function prefillFromPlaid() {
      try {
        const [accountsRes, txRes] = await Promise.all([
          fetch('/api/plaid/accounts'),
          fetch('/api/plaid/transactions?limit=200'),
        ]);
        const accountsData = await accountsRes.json();
        const txData = await txRes.json();

        if (cancelled) return;
        if (!accountsData.success || !txData.success) return;
        if (!accountsData.data?.length || !txData.data?.length) return;

        // Dynamically import insights to avoid bundling server code
        const { deriveFinancialMetrics } = await import('@/lib/plaid/insights');
        const metrics = deriveFinancialMetrics(txData.data, accountsData.data.flatMap((c: { accounts: unknown[] }) => c.accounts), accountsData.data);

        if (cancelled) return;

        // Set verified overrides for scoring
        setVerifiedOverrides({
          incomeVolatility: metrics.incomeVolatility,
          actualDTI: metrics.actualDTI,
          verifiedMonthlyIncome: metrics.verifiedMonthlyIncome,
          liquidReserves: metrics.liquidReserves,
          verifiedSavingsRate: metrics.savingsRate,
        });

        // Pre-fill financial fields from verified data
        if (metrics.verifiedMonthlyIncome > 0 && financial.annualIncome === 0) {
          setFinancial('annualIncome', Math.round(metrics.verifiedMonthlyIncome * 12));
        }
        if (metrics.verifiedMonthlyDebt > 0 && financial.monthlyDebt === 0) {
          setFinancial('monthlyDebt', Math.round(metrics.verifiedMonthlyDebt));
        }
        if (metrics.emergencyFundMonths > 0) {
          setFinancial('emergencyFundMonths', metrics.emergencyFundMonths);
        }
      } catch {
        // Non-critical — assessment works fine without Plaid data
      }
    }
    prefillFromPlaid();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Validation: require at minimum income and target decision amount
  const canProceedFinancial = useMemo(
    () => financial.annualIncome > 0 && financial.targetHomePrice > 0,
    [financial.annualIncome, financial.targetHomePrice],
  );

  const handleNext = useCallback(() => {
    if (!currentQuestion) return;

    // For choice questions, require a selection
    if (
      currentQuestion.question_type === 'single_choice' &&
      (pendingResponse === undefined || pendingResponse === '')
    ) {
      return;
    }

    setDirection(1);

    // Submit the pending response
    if (pendingResponse !== undefined) {
      submitResponse(currentQuestion.id, pendingResponse);
    } else {
      // For sliders, submit the default min value if nothing was changed
      if (currentQuestion.question_type === 'slider' && currentQuestion.options) {
        const config = currentQuestion.options as SliderConfig;
        submitResponse(currentQuestion.id, config.min);
      } else {
        // Submit 0 for number questions with no input
        submitResponse(currentQuestion.id, 0);
      }
    }
  }, [currentQuestion, pendingResponse, submitResponse]);

  const handleBack = useCallback(() => {
    setDirection(-1);
    goBack();
  }, [goBack]);

  // Check for dimension transitions after the flow advances
  useEffect(() => {
    if (!currentQuestion) return;
    const newDim = currentQuestion.dimension;
    const prevDim = prevDimensionRef.current;

    if (newDim !== prevDim) {
      // Dimension changed -- show transition screen
      setTransitionDimension(newDim);
      setShowTransition(true);
      prevDimensionRef.current = newDim;
    }
  }, [currentQuestion]);

  // Handle submit when flow is past end (all questions answered)
  useEffect(() => {
    if (isPastEnd && !isSubmitting) {
      setIsSubmitting(true);

      // Build the payload from responses
      const payload: Record<string, ResponseValue> = {};
      responses.forEach((val, key) => {
        payload[key] = val;
      });

      // Simulate 3s delay then redirect with the scores
      const timer = setTimeout(() => {
        // Encode scores as query params for the results page
        const f = Math.round(liveFinancial);
        const e = Math.round(liveEmotional);
        const t = Math.round(liveTiming);
        const overall = Math.round(assessmentScore.overall);
        router.push(
          `/assess/results?f=${f}&e=${e}&t=${t}&overall=${overall}`,
        );
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isPastEnd, isSubmitting, responses, liveFinancial, liveEmotional, liveTiming, assessmentScore, router]);

  // Keyboard: Enter = next
  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Enter' && !showTransition && !isSubmitting && currentQuestion) {
        e.preventDefault();
        handleNext();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, showTransition, isSubmitting, currentQuestion]);

  // Can proceed validation
  const canProceed = useMemo(() => {
    if (!currentQuestion) return false;
    if (currentQuestion.question_type === 'single_choice') {
      return pendingResponse !== undefined && pendingResponse !== '';
    }
    // Sliders and numbers can always proceed (have default values)
    return true;
  }, [currentQuestion, pendingResponse]);

  // -----------------------------------------------------------------------
  // Render: Processing/submitting state
  // -----------------------------------------------------------------------

  if (isPastEnd || isSubmitting) {
    return <ProcessingState />;
  }

  // -----------------------------------------------------------------------
  // Render: Dimension transition overlay
  // -----------------------------------------------------------------------

  if (showTransition) {
    return (
      <AnimatePresence>
        <DimensionTransition
          dimension={transitionDimension}
          onComplete={() => setShowTransition(false)}
        />
      </AnimatePresence>
    );
  }

  // -----------------------------------------------------------------------
  // Render: No questions loaded
  // -----------------------------------------------------------------------

  if (!currentQuestion) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: '#0a1628' }}
      >
        <p style={{ color: 'var(--text-secondary)' }}>Loading assessment...</p>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: Main question screen
  // -----------------------------------------------------------------------

  const isLastQuestion =
    progress.current === progress.total && isComplete;

  return (
    <div
      className="flex flex-col min-h-[calc(100dvh-64px)] w-full max-w-2xl mx-auto px-4 py-6 sm:py-10"
    >
      {/* Progress bar at top */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <TriSegmentProgress
          financialFraction={financialFraction}
          emotionalFraction={emotionalFraction}
          timingFraction={timingFraction}
          currentDimension={progress.dimension}
        />
      </motion.div>

      {/* Question content with slide animation */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' as const }}
            className="w-full"
          >
            <QuestionScreen
              question={currentQuestion}
              questionNumber={progress.current}
              totalQuestions={progress.total}
              currentResponse={pendingResponse}
              onResponse={setPendingResponse}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error display */}
      {submitError && (
        <motion.div
          className="mt-4 p-3 rounded-lg text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {submitError}
        </motion.div>
      )}

      {/* Navigation buttons */}
      <motion.div
        className="flex items-center justify-between mt-8 pt-6 border-t"
        style={{ borderColor: 'rgba(34, 211, 238, 0.1)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {canGoBack ? (
          <Button
            variant="ghost"
            onClick={handleBack}
            icon={<ChevronLeft size={16} />}
          >
            Back
          </Button>
        ) : (
          <div />
        )}

        {progress.current === progress.total ? (
          <Button
            variant="cta"
            size="lg"
            onClick={handleNext}
            disabled={!canProceed}
            icon={<Sparkles size={18} />}
          >
            Get Your <BrandedName />-Score
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed}
            icon={<ChevronRight size={16} />}
          >
            Next
          </Button>
        )}
      </motion.div>

      {/* Live score preview compass (bottom-right) */}
      {flow.answeredCount > 0 && (
        <LiveScorePreview
          financial={liveFinancial}
          emotional={liveEmotional}
          timing={liveTiming}
        />
      )}
    </div>
  );
}
