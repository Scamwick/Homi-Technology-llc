'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Home,
  Car,
  Briefcase,
  Users,
  LineChart,
  GraduationCap,
  Timer,
  HelpCircle,
} from 'lucide-react';
import { useAssessmentStore, stepToIndex } from '@/stores/assessmentStore';
import type { DecisionType } from '@/stores/assessmentStore';
import { Button, Input, Slider } from '@/components/ui';
import { ProgressDots } from '@/components/scoring';
import { ThresholdCompass, BrandedName } from '@/components/brand';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CREDIT_SCORE_OPTIONS = [
  { label: 'Below 660', value: 580 },
  { label: '660 - 699', value: 680 },
  { label: '700 - 739', value: 720 },
  { label: '740+', value: 780 },
] as const;

const EMERGENCY_FUND_OPTIONS = [
  { label: 'Less than 1 month', value: 0.5 },
  { label: '1 - 3 months', value: 2 },
  { label: '3 - 6 months', value: 4.5 },
  { label: '6+ months', value: 8 },
] as const;

const TIME_HORIZON_OPTIONS = [
  { label: 'Less than 3 months', value: 2 },
  { label: '3 - 6 months', value: 4 },
  { label: '6 - 12 months', value: 9 },
  { label: '12+ months', value: 18 },
] as const;

const DECISION_TYPE_OPTIONS: {
  value: DecisionType;
  label: string;
  icon: typeof Home;
}[] = [
  { value: 'home', label: 'Home Purchase', icon: Home },
  { value: 'car', label: 'Car Purchase', icon: Car },
  { value: 'business', label: 'Business Launch', icon: Briefcase },
  { value: 'career', label: 'Career Change', icon: Users },
  { value: 'investment', label: 'Investment', icon: LineChart },
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'retirement', label: 'Retirement', icon: Timer },
  { value: 'other', label: 'Other', icon: HelpCircle },
];

function getAmountHint(type: DecisionType): string {
  switch (type) {
    case 'home':
      return 'Target home price';
    case 'car':
      return 'Vehicle price';
    case 'business':
      return 'Startup capital needed';
    case 'career':
      return 'Salary change or transition costs';
    case 'investment':
      return 'Investment amount';
    case 'education':
      return 'Tuition and education costs';
    case 'retirement':
      return 'Retirement savings target';
    default:
      return 'Target decision amount';
  }
}

function getSavingsHint(type: DecisionType): string {
  switch (type) {
    case 'home':
      return 'Down payment saved';
    case 'car':
      return 'Down payment or trade-in value';
    case 'business':
      return 'Capital already set aside';
    case 'investment':
      return 'Funds allocated for investing';
    case 'education':
      return 'Education savings (529, etc.)';
    default:
      return 'Savings set aside for this decision';
  }
}

const STEP_LABELS = ['Financial', 'Emotional', 'Timing'];

const SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

// ---------------------------------------------------------------------------
// Currency Input Helper
// ---------------------------------------------------------------------------

function CurrencyInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  const [displayValue, setDisplayValue] = useState(
    value > 0 ? value.toLocaleString('en-US') : '',
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      const num = raw ? parseInt(raw, 10) : 0;
      setDisplayValue(raw ? num.toLocaleString('en-US') : '');
      onChange(num);
    },
    [onChange],
  );


  return (
    <Input
      label={label}
              value={value === 0 ? '' : displayValue}
      onChange={handleChange}
      leadingIcon={<DollarSign size={16} />}
      placeholder="0"
      inputMode="numeric"
      hint={hint}
      fullWidth
    />
  );
}

// ---------------------------------------------------------------------------
// Select Card Helper
// ---------------------------------------------------------------------------

function SelectCard({
  options,
  value,
  onChange,
  label,
}: {
  options: ReadonlyArray<{ label: string; value: number }>;
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-sm font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border text-left"
              style={{
                background: isSelected
                  ? 'rgba(34, 211, 238, 0.12)'
                  : 'rgba(30, 41, 59, 0.6)',
                borderColor: isSelected
                  ? 'var(--cyan)'
                  : 'rgba(51, 65, 85, 0.5)',
                color: isSelected
                  ? 'var(--cyan)'
                  : 'var(--text-secondary)',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step Components
// ---------------------------------------------------------------------------

function FinancialStep() {
  const financial = useAssessmentStore((s) => s.financial);
  const setFinancial = useAssessmentStore((s) => s.setFinancial);
  const decisionType = useAssessmentStore((s) => s.decisionType);
  const setDecisionType = useAssessmentStore((s) => s.setDecisionType);

  return (
    <div className="flex flex-col gap-6">
      {/* Decision Type Selector */}
      <div className="flex flex-col gap-2 mb-2">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--emerald)' }}
        >
          What decision are you evaluating?
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DECISION_TYPE_OPTIONS.map((opt) => {
            const isSelected = decisionType === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDecisionType(opt.value)}
                className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border"
                style={{
                  background: isSelected
                    ? 'rgba(52, 211, 153, 0.12)'
                    : 'rgba(30, 41, 59, 0.6)',
                  borderColor: isSelected
                    ? 'var(--emerald)'
                    : 'rgba(51, 65, 85, 0.5)',
                  color: isSelected
                    ? 'var(--emerald)'
                    : 'var(--text-secondary)',
                }}
              >
                <Icon size={16} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{ background: 'rgba(34, 211, 238, 0.12)' }}
        >
          <Shield size={20} style={{ color: 'var(--cyan)' }} />
        </div>
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Financial Reality
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Let&apos;s understand where you stand financially.
          </p>
        </div>
      </div>

      <CurrencyInput
        label="Annual Household Income"
        value={financial.annualIncome}
        onChange={(v) => setFinancial('annualIncome', v)}
        hint="Before taxes, all household earners combined"
      />

      <CurrencyInput
        label="Total Monthly Debt Payments"
        value={financial.monthlyDebt}
        onChange={(v) => setFinancial('monthlyDebt', v)}
        hint="Student loans, car payments, credit cards, etc."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput
          label="Savings Set Aside"
          value={financial.downPaymentSaved}
          onChange={(v) => setFinancial('downPaymentSaved', v)}
          hint={getSavingsHint(decisionType)}
        />
        <CurrencyInput
          label="Target Decision Amount"
          value={financial.targetHomePrice}
          onChange={(v) => setFinancial('targetHomePrice', v)}
          hint={getAmountHint(decisionType)}
        />
      </div>

      <SelectCard
        label="Credit Score Range"
        options={CREDIT_SCORE_OPTIONS}
        value={financial.creditScore}
        onChange={(v) => setFinancial('creditScore', v)}
      />

      <SelectCard
        label="Emergency Fund"
        options={EMERGENCY_FUND_OPTIONS}
        value={financial.emergencyFundMonths}
        onChange={(v) => setFinancial('emergencyFundMonths', v)}
      />
    </div>
  );
}

function EmotionalStep() {
  const emotional = useAssessmentStore((s) => s.emotional);
  const setEmotional = useAssessmentStore((s) => s.setEmotional);
  const isSolo = useAssessmentStore((s) => s.isSolo);
  const setSolo = useAssessmentStore((s) => s.setSolo);

  return (
    <div className="flex flex-col gap-8">
      {/* Step header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{ background: 'rgba(52, 211, 153, 0.12)' }}
        >
          <Heart size={20} style={{ color: 'var(--emerald)' }} />
        </div>
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Emotional Truth
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Be honest with yourself. There are no wrong answers.
          </p>
        </div>
      </div>

      <Slider
        label="How stable does your life feel right now?"
        min={1}
        max={10}
        step={1}
        value={emotional.lifeStability}
        onChange={(v) => setEmotional('lifeStability', v)}
        color="emerald"
      />

      <Slider
        label="How confident are you in this decision?"
        min={1}
        max={10}
        step={1}
        value={emotional.confidenceLevel}
        onChange={(v) => setEmotional('confidenceLevel', v)}
        color="emerald"
      />

      {/* Partner alignment with solo toggle */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Are you and your partner aligned?
          </span>
          <button
            type="button"
            onClick={() => setSolo(!isSolo)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border"
            style={{
              background: isSolo
                ? 'rgba(52, 211, 153, 0.12)'
                : 'rgba(30, 41, 59, 0.6)',
              borderColor: isSolo
                ? 'var(--emerald)'
                : 'rgba(51, 65, 85, 0.5)',
              color: isSolo ? 'var(--emerald)' : 'var(--text-secondary)',
            }}
          >
            <div
              className="w-3 h-3 rounded-full transition-colors duration-200"
              style={{
                background: isSolo ? 'var(--emerald)' : 'var(--slate-light)',
              }}
            />
            I&apos;m doing this solo
          </button>
        </div>

        {!isSolo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Slider
              min={1}
              max={10}
              step={1}
              value={emotional.partnerAlignment ?? 5}
              onChange={(v) => setEmotional('partnerAlignment', v)}
              color="emerald"
            />
          </motion.div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            No pressure
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            Extreme pressure
          </span>
        </div>
        <Slider
          label="How much pressure do you feel to act now?"
          min={1}
          max={10}
          step={1}
          value={emotional.fomoLevel}
          onChange={(v) => setEmotional('fomoLevel', v)}
          color="emerald"
        />
      </div>
    </div>
  );
}

function TimingStep() {
  const timing = useAssessmentStore((s) => s.timing);
  const setTiming = useAssessmentStore((s) => s.setTiming);

  return (
    <div className="flex flex-col gap-8">
      {/* Step header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{ background: 'rgba(250, 204, 21, 0.12)' }}
        >
          <Clock size={20} style={{ color: 'var(--yellow)' }} />
        </div>
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Perfect Timing
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Timing isn&apos;t everything, but it matters.
          </p>
        </div>
      </div>

      <SelectCard
        label="When do you plan to make this decision?"
        options={TIME_HORIZON_OPTIONS}
        value={timing.timeHorizonMonths}
        onChange={(v) => setTiming('timeHorizonMonths', v)}
      />

      <Slider
        label="What percentage of your income do you save monthly?"
        min={0}
        max={50}
        step={1}
        value={timing.monthlySavingsRate}
        onChange={(v) => setTiming('monthlySavingsRate', v)}
        color="yellow"
      />

      <Slider
        label="How much of your savings goal have you reached?"
        min={0}
        max={100}
        step={1}
        value={timing.downPaymentProgress}
        onChange={(v) => setTiming('downPaymentProgress', v)}
        color="yellow"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Processing State
// ---------------------------------------------------------------------------

function ProcessingState() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'var(--navy, #0a1628)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <ThresholdCompass size={200} animate />
      </motion.div>

      <motion.p
        className="mt-8 text-lg font-medium text-center max-w-sm px-4"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Analyzing your readiness across three dimensions...
      </motion.p>

      {/* Subtle pulsing dots */}
      <motion.div
        className="flex gap-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
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

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

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

  const [direction, setDirection] = useState(0);

  // Auto-start on the financial step
  useEffect(() => {
    if (currentStep === 'idle') {
      goToStep('financial');
    }
  }, [currentStep, goToStep]);

  // Validation: require at minimum income and target decision amount
  const canProceedFinancial = useMemo(
    () => financial.annualIncome > 0 && financial.targetHomePrice > 0,
    [financial.annualIncome, financial.targetHomePrice],
  );

  const handleNext = useCallback(() => {
    setDirection(1);
    if (currentStep === 'timing') {
      // Final step — submit
      submit()
        .then((result) => {
          router.push(`/assess/${result.id}`);
        })
        .catch(() => {
          // Error is stored in the store, displayed in UI
        });
    } else {
      nextStep();
    }
  }, [currentStep, nextStep, submit, router]);

  const handleBack = useCallback(() => {
    setDirection(-1);
    prevStep();
  }, [prevStep]);

  const isFirstStep = currentStep === 'financial';
  const isLastStep = currentStep === 'timing';
  const stepIndex = stepToIndex(currentStep);

  const isNextDisabled = useMemo(() => {
    if (currentStep === 'financial') return !canProceedFinancial;
    return false;
  }, [currentStep, canProceedFinancial]);

  // Show processing overlay
  if (currentStep === 'processing' || submitting) {
    return <ProcessingState />;
  }

  // Don't render assessment UI for non-assessment steps
  if (currentStep === 'idle' || currentStep === 'results') {
    return null;
  }

  return (
    <div className="flex flex-col flex-1 w-full max-w-xl mx-auto px-4 py-6 sm:py-10">
      {/* Progress indicator */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ProgressDots
          totalSteps={3}
          currentStep={stepIndex}
          labels={STEP_LABELS}
        />
      </motion.div>

      {/* Step content with slide animation */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' as const }}
          >
            {currentStep === 'financial' && <FinancialStep />}
            {currentStep === 'emotional' && <EmotionalStep />}
            {currentStep === 'timing' && <TimingStep />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error display */}
      {error && (
        <motion.div
          className="mt-4 p-3 rounded-lg text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--homi-crimson)',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
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
        {!isFirstStep ? (
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

        {isLastStep ? (
          <Button
            variant="cta"
            size="lg"
            onClick={handleNext}
            disabled={isNextDisabled}
            loading={submitting}
            icon={<Sparkles size={18} />}
          >
            Get Your <BrandedName />-Score
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={isNextDisabled}
            icon={<ChevronRight size={16} />}
          >
            Next
          </Button>
        )}
      </motion.div>
    </div>
  );
}
