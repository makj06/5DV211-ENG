import React from "react";

export default function ProblemCard({
                                        taskText,
                                        answer,
                                        onChangeAnswer,
                                        onSubmitAnswer,
                                        answerInputRef,
                                    }) {
    return (
        <div className="card glass problemCard">
            <div className="problemHeader">
                <div className="problemTitle">Solve the problem below:</div>
            </div>

            <div className="problemBody">
                <p className="problemText">{taskText}</p>

                <div className="problemSpacer" aria-hidden="true" />

                <div className="equationCard">
                    <form className="equationBottom" onSubmit={onSubmitAnswer}>
                        <input
                            ref={answerInputRef}
                            className="answerInput answerInput--wide"
                            value={answer}
                            onChange={(e) => onChangeAnswer(e.target.value)}
                            placeholder="Type your answer…"
                            inputMode="decimal"
                            autoComplete="off"
                        />
                        <button type="submit" className="submitBtn">
                            Submit Answer
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}