import { useEffect, useRef, useState } from "react";
import { ArrowUp, PenTool, X } from "lucide-react";
import { ART_MEDIUMS, GRADE_LEVELS, STAGE_DEFINITIONS } from "../data/classPrompts";
import type { ArtMedium, ChatMessage, GradeLevel } from "../types/studio";
import { SketchPad } from "./SketchPad";

interface MentorChatProps {
  gradeLevel: GradeLevel;
  medium: ArtMedium;
  theme: string;
  currentStage: number;
  messages: ChatMessage[];
  quickReplies: string[];
  isLoading: boolean;
  errorMessage: string | null;
  onChangeGrade: (grade: GradeLevel) => void;
  onChangeMedium: (medium: ArtMedium) => void;
  onChangeTheme: (theme: string) => void;
  onSelectStage: (stageId: number) => void;
  onSendMessage: (text: string, sketchDataUrl?: string) => void;
}

export function MentorChat({
  gradeLevel,
  medium,
  theme,
  currentStage,
  messages,
  quickReplies,
  isLoading,
  errorMessage,
  onChangeGrade,
  onChangeMedium,
  onChangeTheme,
  onSelectStage,
  onSendMessage,
}: MentorChatProps) {
  const [inputText, setInputText] = useState("");
  const [showSketchPad, setShowSketchPad] = useState(false);
  const [pendingSketchUrl, setPendingSketchUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed && !pendingSketchUrl) return;
    const messageToSend = trimmed || "방금 그린 스케치 구도를 보고 조언해 주세요.";
    onSendMessage(messageToSend, pendingSketchUrl ?? undefined);
    setInputText("");
    setPendingSketchUrl(null);
    setShowSketchPad(false);
  }

  function handleQuickReply(reply: string) {
    if (isLoading) return;
    onSendMessage(reply, pendingSketchUrl ?? undefined);
    setPendingSketchUrl(null);
  }

  return (
    <section className="flex flex-col rounded-xl border border-stone-200 bg-white">
      {/* Studio Context Bar */}
      <div className="border-b border-stone-200 px-5 py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="ctx-grade" className="block text-xs font-medium text-stone-500">
              학년 수준
            </label>
            <select
              id="ctx-grade"
              value={gradeLevel}
              onChange={(e) => onChangeGrade(e.target.value as GradeLevel)}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-900 focus:border-amber-500 focus:bg-white focus:outline-none"
            >
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ctx-medium" className="block text-xs font-medium text-stone-500">
              표현 매체
            </label>
            <select
              id="ctx-medium"
              value={medium}
              onChange={(e) => onChangeMedium(e.target.value as ArtMedium)}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-900 focus:border-amber-500 focus:bg-white focus:outline-none"
            >
              {ART_MEDIUMS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ctx-theme" className="block text-xs font-medium text-stone-500">
              수업 주제
            </label>
            <input
              id="ctx-theme"
              type="text"
              value={theme}
              onChange={(e) => onChangeTheme(e.target.value)}
              placeholder="예: 나를 닮은 사물, 기억 속의 빛"
              className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Guided 4-Stage Stepper */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-lg bg-stone-100 p-1 sm:grid-cols-4">
          {STAGE_DEFINITIONS.map((stage) => {
            const active = currentStage === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(stage.id)}
                title={stage.subtitle}
                className={`cursor-pointer rounded-md px-3 py-2 text-left transition-colors ${
                  active
                    ? "bg-white text-stone-950 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-medium whitespace-nowrap">
                  <span
                    className={`font-mono-tabular ${
                      active ? "text-amber-600" : "text-stone-400"
                    }`}
                  >
                    {stage.number}.
                  </span>
                  <span className="truncate">{stage.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Conversation Stream */}
      <div
        ref={scrollRef}
        className="studio-grid-bg flex-1 space-y-5 overflow-y-auto px-5 py-6"
        style={{ minHeight: "400px", maxHeight: "560px" }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-stone-500">
                <span className="font-medium text-stone-700">
                  {isUser ? "학생" : "아뜰리에 멘토"}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[88%] rounded-xl px-4 py-3.5 text-sm leading-relaxed sm:max-w-[80%] ${
                  isUser
                    ? "bg-amber-500 font-medium text-stone-950"
                    : "border border-stone-200 bg-white text-stone-800"
                }`}
              >
                {msg.sketchPreviewUrl && (
                  <div className="mb-2.5 overflow-hidden rounded-lg border border-stone-950/15 bg-white">
                    <img
                      src={msg.sketchPreviewUrl}
                      alt="학생이 첨부한 러프 스케치"
                      referrerPolicy="no-referrer"
                      className="max-h-48 w-full object-contain"
                    />
                  </div>
                )}

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.mentorTip && (
                  <div className="mt-3 border-t border-stone-100 pt-2.5 text-xs text-stone-600">
                    <span className="font-semibold text-amber-700">실기 팁 · </span>
                    {msg.mentorTip}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="mb-1 text-xs font-medium text-stone-600">아뜰리에 멘토</div>
            <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-500">
              아이디어를 함께 정리하고 있습니다...
            </div>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            {errorMessage}
          </div>
        )}
      </div>

      {/* Quick Reply Suggestions + Composer */}
      <div className="border-t border-stone-200 bg-white px-5 py-4">
        {quickReplies.length > 0 && !showSketchPad && (
          <div className="mb-3 flex flex-wrap gap-2">
            {quickReplies.map((qr, idx) => (
              <button
                key={`${qr}-${idx}`}
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickReply(qr)}
                className="cursor-pointer rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-left text-xs font-medium text-stone-700 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 disabled:opacity-50"
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        {showSketchPad && (
          <div className="mb-3">
            <SketchPad
              onAttachSketch={(url) => {
                setPendingSketchUrl(url);
                setShowSketchPad(false);
              }}
              onCancel={() => setShowSketchPad(false)}
            />
          </div>
        )}

        {pendingSketchUrl && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50/70 px-3 py-2">
            <div className="flex items-center gap-3">
              <img
                src={pendingSketchUrl}
                alt="첨부 예정 스케치"
                referrerPolicy="no-referrer"
                className="h-12 w-16 rounded border border-stone-200 bg-white object-contain"
              />
              <span className="text-xs font-medium text-stone-700">
                스케치가 첨부되었습니다. 질문을 입력해 함께 보내세요.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPendingSketchUrl(null)}
              aria-label="첨부 스케치 삭제"
              className="cursor-pointer rounded-md p-1 text-stone-500 hover:bg-white hover:text-stone-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setShowSketchPad((prev) => !prev)}
            className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              showSketchPad
                ? "border-amber-500 bg-amber-50 text-amber-900"
                : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            <PenTool className="h-3.5 w-3.5" aria-hidden="true" />
            스케치
          </button>

          <div className="flex-1">
            <label htmlFor="mentor-input" className="sr-only">
              멘토에게 보낼 메시지
            </label>
            <input
              id="mentor-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="떠오른 생각이나 막히는 부분을 편하게 이야기해 보세요..."
              className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || (!inputText.trim() && !pendingSketchUrl)}
            aria-label="보내기"
            className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 whitespace-nowrap shrink-0"
          >
            <span>보내기</span>
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
