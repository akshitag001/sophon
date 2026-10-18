import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, RotateCcw, Award } from 'lucide-react';
export const RiskQuestionnaire = ({ userId, onProfileUpdated }) => {
    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({
        // Defaults matching Priya for convenient testing
        age_band: '18-29',
        horizon: '3_to_7_years',
        goal_type: 'balanced_growth',
        income_stability: 'stable_salary',
        emergency_savings: '3_to_6',
        existing_debt: 'low_or_mortgage_only',
        investment_experience: 'beginner_cash_deposits',
        reaction_to_drop: 'hold',
        loss_tolerance: 'max_15_percent',
        liquidity_needs: '2_to_5_years'
    });
    const [existingProfile, setExistingProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => {
        loadData();
    }, [userId]);
    const loadData = async () => {
        setLoading(true);
        try {
            const qRes = await api.getQuestions();
            setQuestions(qRes.questions);
            const profile = await api.getProfile(userId).catch(() => null);
            if (profile) {
                setExistingProfile(profile);
                setAnswers(profile.answers);
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSelect = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const profile = await api.submitProfile(userId, answers);
            setExistingProfile(profile);
            setIsEditing(false);
            if (onProfileUpdated)
                onProfileUpdated(profile);
        }
        catch (err) {
            alert(`Error submitting profile: ${err.message}`);
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64 text-slate-400", children: "Loading risk questionnaire framework..." }));
    }
    // Profile Result View
    if (existingProfile && !isEditing) {
        const p = existingProfile;
        const levelColors = {
            1: 'from-blue-500 to-indigo-600',
            2: 'from-teal-400 to-cyan-600',
            3: 'from-brand-cyan to-blue-500',
            4: 'from-amber-400 to-orange-500',
            5: 'from-rose-500 to-red-600'
        };
        return (_jsx("div", { className: "max-w-4xl mx-auto space-y-6", children: _jsxs("div", { className: "bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden", children: [_jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-navy-800", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "text-xs uppercase font-mono tracking-wider text-brand-cyan", children: "Verified Risk Assessment" }), _jsxs("span", { className: "text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full", children: ["Valid until ", new Date(p.expires_at).toLocaleDateString()] })] }), _jsxs("h2", { className: "text-2xl font-bold text-white", children: ["Investor Risk Profile: ", p.label] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "MiFID II Suitability Gate: Final level is the lower of objective capacity and psychological tolerance." })] }), _jsxs("button", { onClick: () => setIsEditing(true), className: "px-4 py-2 text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 rounded-xl transition flex items-center gap-1.5", children: [_jsx(RotateCcw, { className: "w-3.5 h-3.5" }), " Retake Questionnaire"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 my-6", children: [_jsxs("div", { className: "p-5 bg-navy-850 border border-navy-800 rounded-xl flex flex-col items-center justify-center text-center", children: [_jsx("span", { className: "text-xs text-slate-400 font-medium mb-2", children: "Final Approved Risk Level" }), _jsxs("div", { className: `w-20 h-20 rounded-2xl bg-gradient-to-tr ${levelColors[p.level]} flex items-center justify-center text-3xl font-black text-navy-950 shadow-xl`, children: [p.level, " / 5"] }), _jsx("span", { className: "text-sm font-bold text-white mt-2", children: p.label }), _jsx("span", { className: "text-[11px] text-slate-400 mt-0.5", children: "min(Capacity, Tolerance)" })] }), _jsxs("div", { className: "md:col-span-2 p-5 bg-navy-850 border border-navy-800 rounded-xl space-y-4 justify-center flex flex-col", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs mb-1.5", children: [_jsx("span", { className: "text-slate-300 font-medium", children: "Objective Financial Capacity:" }), _jsxs("span", { className: "font-bold text-brand-cyan", children: [p.capacity, " / 5"] })] }), _jsx("div", { className: "w-full bg-navy-950 h-3 rounded-full overflow-hidden border border-navy-700/60", children: _jsx("div", { className: "h-full bg-gradient-to-r from-brand-cyan to-blue-500 rounded-full transition-all duration-700", style: { width: `${(p.capacity / 5) * 100}%` } }) }), _jsx("span", { className: "text-[10px] text-slate-400 mt-1 block", children: "Based on horizon, income security, debt, and emergency savings cushion." })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs mb-1.5", children: [_jsx("span", { className: "text-slate-300 font-medium", children: "Psychological Risk Tolerance:" }), _jsxs("span", { className: "font-bold text-teal-400", children: [p.tolerance, " / 5"] })] }), _jsx("div", { className: "w-full bg-navy-950 h-3 rounded-full overflow-hidden border border-navy-700/60", children: _jsx("div", { className: "h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-700", style: { width: `${(p.tolerance / 5) * 100}%` } }) }), _jsx("span", { className: "text-[10px] text-slate-400 mt-1 block", children: "Based on reaction to 20% drops, loss tolerance, and experience." })] })] })] }), p.contradictions && p.contradictions.length > 0 && (_jsxs("div", { className: "p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6 flex items-start gap-3", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-amber-400 shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-amber-300", children: "Contradictions Detected" }), _jsx("ul", { className: "text-xs text-amber-200/90 list-disc list-inside mt-1 space-y-0.5", children: p.contradictions.map((c, i) => (_jsx("li", { children: c }, i))) })] })] })), _jsxs("div", { children: [_jsx("h4", { className: "text-xs uppercase font-mono tracking-wider text-slate-400 mb-2", children: "Audited Suitability Facts" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: p.explanation_facts.map((fact, idx) => (_jsxs("div", { className: "p-3 bg-navy-950/60 border border-navy-800 rounded-xl text-xs text-slate-300 flex items-start gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-brand-cyan shrink-0 mt-0.5" }), _jsx("span", { children: fact })] }, idx))) })] })] }) }));
    }
    // Stepper Questionnaire View
    const currentQ = questions[currentStep] || questions[0];
    const progress = ((currentStep + 1) / questions.length) * 100;
    return (_jsx("div", { className: "max-w-3xl mx-auto space-y-6", children: _jsxs("div", { className: "bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-2xl", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400 mb-2 font-mono", children: [_jsxs("span", { children: ["QUESTION ", currentStep + 1, " OF ", questions.length] }), _jsxs("span", { children: [Math.round(progress), "% COMPLETED"] })] }), _jsx("div", { className: "w-full bg-navy-950 h-2 rounded-full overflow-hidden border border-navy-800", children: _jsx("div", { className: "h-full bg-gradient-to-r from-brand-cyan to-blue-500 rounded-full transition-all duration-300", style: { width: `${progress}%` } }) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-xl font-bold text-white leading-snug", children: currentQ.question }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Select the option that most accurately represents your situation." })] }), _jsx("div", { className: "space-y-3 mb-8", children: currentQ.options.map((opt) => {
                        const isSelected = answers[currentQ.id] === opt.value;
                        return (_jsxs("button", { onClick: () => handleSelect(currentQ.id, opt.value), className: `w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between ${isSelected
                                ? 'bg-blue-600/20 border-brand-cyan text-white shadow-lg shadow-brand-cyan/10'
                                : 'bg-navy-850 hover:bg-navy-800 border-navy-700/80 text-slate-300'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-brand-cyan bg-brand-cyan' : 'border-slate-500'}`, children: isSelected && _jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-navy-950" }) }), _jsx("span", { className: "text-sm font-medium", children: opt.label })] }), _jsxs("span", { className: "text-xs font-mono text-slate-400", children: [opt.points, " pts"] })] }, opt.value));
                    }) }), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-navy-800", children: [_jsxs("button", { onClick: () => setCurrentStep((prev) => Math.max(0, prev - 1)), disabled: currentStep === 0, className: "px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 flex items-center gap-1.5 transition", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), " Previous"] }), currentStep < questions.length - 1 ? (_jsxs("button", { onClick: () => setCurrentStep((prev) => Math.min(questions.length - 1, prev + 1)), className: "px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-cyan text-navy-950 hover:bg-cyan-300 shadow-lg shadow-brand-cyan/20 flex items-center gap-1.5 transition", children: ["Next ", _jsx(ArrowRight, { className: "w-4 h-4" })] })) : (_jsxs("button", { onClick: handleSubmit, disabled: submitting, className: "px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-cyan to-blue-500 text-navy-950 hover:opacity-90 shadow-xl shadow-brand-cyan/30 flex items-center gap-1.5 transition", children: [_jsx(Award, { className: "w-4 h-4" }), submitting ? 'Scoring Profile...' : 'Complete & Generate Profile'] }))] })] }) }));
};
