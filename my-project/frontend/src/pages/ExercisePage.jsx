import React, {
    useMemo,
    useRef,
    useState,
    useCallback,
    useEffect,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TOPIC_CONFIG } from "../config/topics";
import "../styles/pages/ExercisePage.css";

import LoadingOverlay from "../components/exercise/LoadingOverlay";
import ErrorOverlay from "../components/exercise/ErrorOverlay";
import Topbar from "../components/exercise/Topbar";
import ProblemCard from "../components/exercise/ProblemCard";
import KeypadCard from "../components/exercise/KeypadCard";
import ChatDrawer from "../components/exercise/ChatDrawer";
import ChatFab from "../components/exercise/ChatFab";
import ResultModal from "../components/exercise/ResultModal";
import MilestoneModal from "../components/exercise/MilestoneModal";

import { useExercise } from "../hooks/useExercise";
import { useChatbot } from "../hooks/useChatbot";
import { useEvalSolution } from "../hooks/useEvalSolution";
import { useExercisePageUser } from "../hooks/useExercisePageUser";
import { useExerciseKeypad } from "../hooks/useExerciseKeypad";
import { useResultModal } from "../hooks/useResultModal";
import { useDialogEscapeBlock } from "../hooks/useDialogEscapeBlock";

export default function ExercisePage() {
    const { section, topic } = useParams();
    const navigate = useNavigate();

    const normalizedTopic = useMemo(
        () => String(topic ?? "").trim().toLowerCase(),
        [topic]
    );

    const meta = useMemo(() => {
        const s = TOPIC_CONFIG?.[section];
        const t = s?.topics?.[topic];

        return {
            sectionLabel: s?.label ?? "Topic",
            topicLabel: t?.label ?? "Exercise",
            bgClass: s?.theme?.bgClass ?? "theme--default",
            pillTone: s?.theme?.pillTone ?? "purple",
        };
    }, [section, topic]);

    const { name, userModel, fetchUserModel } = useExercisePageUser();

    const [answer, setAnswer] = useState("");
    const [message, setMessage] = useState("");
    const isSmallDevice = () => window.innerWidth <= 980;
    const [chatOpen, setChatOpen] = useState(() => !isSmallDevice());
    const [hasFailed, setHasFailed] = useState(false);
    const [hasChatted, setHasChatted] = useState(false);
    const [milestoneOpen, setMilestoneOpen] = useState(false);
    const [preEvalTopicLevel, setPreEvalTopicLevel] = useState(null);

    const answerInputRef = useRef(null);

    const currentTopicLevel = useMemo(() => {
        return userModel?.knowledge?.[normalizedTopic] ?? 0;
    }, [userModel, normalizedTopic]);

    const exerciseCacheKey = useMemo(() => {
        if (!name || !normalizedTopic) return "";
        return `exercise_cache:${name}:${normalizedTopic}`;
    }, [name, normalizedTopic]);

    const clearTopicExerciseCache = useCallback(() => {
        if (!exerciseCacheKey) return;
        try {
            localStorage.removeItem(exerciseCacheKey);
        } catch {
            // ignore localStorage failures
        }
    }, [exerciseCacheKey]);

    const goDashboard = useCallback(() => {
        navigate("/frontPage");
    }, [navigate]);

    useEffect(() => {
        if (isSmallDevice()) {
            setChatOpen(false);
        }
    }, []);

    const {
        taskText,
        loading,
        error,
        loadExercise,
        clearCachedExercise,
    } = useExercise({
        name,
        topic: normalizedTopic,
        onLoaded: () => {
            setAnswer("");
            setHasFailed(false);
            setHasChatted(false);
            setPreEvalTopicLevel(null);
            resetWrongTries();

            setTimeout(() => answerInputRef.current?.focus(), 50);
        },
    });

    const {
        chatMessages,
        chatLoading,
        chatError,
        sendMessage,
    } = useChatbot({
        name,
        topic: normalizedTopic,
        chatOpen,
        current_task: taskText,
    });

    const handleSend = useCallback(
        (e) => {
            e.preventDefault();

            const text = message.trim();
            if (!text) return;

            setMessage("");
            setHasChatted(true);
            sendMessage(text);
        },
        [message, sendMessage]
    );

    const {
        evalResult,
        loading: evalLoading,
        error: evalError,
        evaluate,
    } = useEvalSolution({
        name,
        topic: normalizedTopic,
        task: taskText,
        solution: answer,
        hasFailed,
        hasChatted,
        auto: false,
        onEvaluated: fetchUserModel,
    });

    const {
        resultOpen,
        setResultOpen,
        wrongTries,
        resetWrongTries,
        modalView,
    } = useResultModal(evalResult);

    const {
        keypad,
        focusAnswerInput,
        appendToAnswer,
        backspace,
        clearAnswer,
    } = useExerciseKeypad({
        normalizedTopic,
        answerInputRef,
        setAnswer,
    });

    useDialogEscapeBlock(resultOpen || milestoneOpen);

    const handleSubmitAnswer = useCallback(
        async (e) => {
            e?.preventDefault?.();

            if (resultOpen || milestoneOpen) return;
            if (!taskText?.trim() || !normalizedTopic) return;

            setPreEvalTopicLevel(currentTopicLevel);

            const result = await evaluate();
            if (result && !result.correct) {
                setHasFailed(true);
            }
        },
        [
            resultOpen,
            milestoneOpen,
            taskText,
            normalizedTopic,
            currentTopicLevel,
            evaluate,
        ]
    );

    const closeResult = useCallback(() => {
        setResultOpen(false);
        focusAnswerInput();
    }, [setResultOpen, focusAnswerInput]);

    const handleRetry = useCallback(() => {
        setAnswer("");
        closeResult();
    }, [closeResult]);

    const handleNext = useCallback(async () => {
        const freshUser = await fetchUserModel();
        const nextLevel = freshUser?.knowledge?.[normalizedTopic] ?? 0;

        const reachedLevelFiveNow =
            preEvalTopicLevel !== null &&
            preEvalTopicLevel < 5 &&
            nextLevel === 5;

        if (reachedLevelFiveNow) {
            clearCachedExercise?.();
            clearTopicExerciseCache();
            setResultOpen(false);
            setMilestoneOpen(true);
            return;
        }

        setResultOpen(false);
        clearCachedExercise?.();
        loadExercise({ force: true });
    }, [
        fetchUserModel,
        normalizedTopic,
        preEvalTopicLevel,
        clearCachedExercise,
        clearTopicExerciseCache,
        loadExercise,
        setResultOpen,
    ]);

    const handleRegenerate = useCallback(() => {
        setResultOpen(false);
        clearCachedExercise?.();
        loadExercise({ force: true });
    }, [clearCachedExercise, loadExercise, setResultOpen]);

    const closeMilestoneAndContinue = useCallback(() => {
        setMilestoneOpen(false);
        clearCachedExercise?.();
        loadExercise({ force: true });
    }, [clearCachedExercise, loadExercise]);

    const closeMilestoneToDashboard = useCallback(() => {
        setMilestoneOpen(false);
        goDashboard();
    }, [goDashboard]);

    if (!name) return null;

    return (
        <div className={`solverPage ${meta.bgClass}`}>
            {(loading || evalLoading) && (
                <LoadingOverlay title={loading ? "Loading exercise…" : "Evaluating…"} />
            )}

            {!loading && error && (
                <ErrorOverlay
                    error={error}
                    onRetry={() => loadExercise({ force: true })}
                    onDashboard={goDashboard}
                />
            )}

            <div className="solverContainer">
                <Topbar
                    onDashboard={goDashboard}
                    pillTone={meta.pillTone}
                    topicLabel={meta.topicLabel}
                />

                <div className={`solverGrid ${chatOpen ? "hasChat" : "noChat"}`}>
                    <ProblemCard
                        taskText={taskText}
                        answer={answer}
                        onChangeAnswer={setAnswer}
                        onSubmitAnswer={handleSubmitAnswer}
                        answerInputRef={answerInputRef}
                    />

                    <KeypadCard
                        keypad={keypad}
                        onPressKey={appendToAnswer}
                        onBackspace={backspace}
                        onClear={clearAnswer}
                    />

                    <ChatDrawer
                        chatOpen={chatOpen}
                        onClose={() => setChatOpen(false)}
                        chatMessages={chatMessages}
                        chatLoading={chatLoading}
                        chatError={chatError}
                        message={message}
                        onChangeMessage={setMessage}
                        onSend={handleSend}
                    />
                </div>

                {evalError && <div className="evaluationCard errorText">{evalError}</div>}

                <ResultModal
                    open={resultOpen}
                    evalResult={evalResult}
                    modalView={modalView}
                    wrongTries={wrongTries}
                    loading={loading}
                    evalLoading={evalLoading}
                    onRetry={handleRetry}
                    onNext={handleNext}
                    onDashboard={goDashboard}
                    onRegenerate={handleRegenerate}
                />

                <MilestoneModal
                    open={milestoneOpen}
                    topicLabel={meta.topicLabel}
                    onContinue={closeMilestoneAndContinue}
                    onDashboard={closeMilestoneToDashboard}
                />

                <ChatFab
                    chatOpen={chatOpen}
                    onToggle={() => setChatOpen((prev) => !prev)}
                />
            </div>
        </div>
    );
}