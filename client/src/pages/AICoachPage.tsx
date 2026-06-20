import { useState } from "react";
import { CoachHeader } from "../components/AICoach/CoachHeader";
import { TabNav } from "../components/AICoach/TabNav";
import type { Tab } from "../components/AICoach/TabNav";
import { InsightsTab } from "../components/AICoach/InsightsTab";
import type { InsightCard } from "../components/AICoach/InsightsTab";
import { ChatTab } from "../components/AICoach/ChatTab";
import type { ChatMessage } from "../components/AICoach/ChatTab";
import { ChatInputBar } from "../components/AICoach/ChatInputBar";

// ─── Constants ────────────────────────────────────────────────────────────────
const SUGGESTION_CHIPS = [
  { icon: "📈", text: "How should I program my next push day?" },
  { icon: "📉", text: "What's my weakest pattern right now?" },
  { icon: "📅", text: "Suggest a 4-week squat programme" },
  { icon: "⚠️", text: "Am I overtraining?" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export function AICoachPage() {
  // ─── TAB STATE ──────────────────────────────────────────────────────────────
  // TODO: This component needs to track which tab (insights / chat) is active.
  const [activeTab, setActiveTab] = useState<Tab>("insights");
  const [isChatbotDisabled] = useState(true); // WIP flag

  // ─── INSIGHTS DATA ──────────────────────────────────────────────────────────
  // TODO: This component needs AI-generated insight cards.
  const heroInsight: InsightCard | null = null;
  const secondaryInsights: InsightCard[] = [];

  // TODO: This component needs the total number of sessions analyzed.
  const sessionsAnalyzed: number | null = null;

  // ─── CHAT DATA ──────────────────────────────────────────────────────────────
  // TODO: This component needs the chat message history.
  const messages: ChatMessage[] = [];

  // TODO: This component needs to track the current input value.
  const chatInput: string = "";

  // TODO: This component needs to know if the AI is currently generating a response.
  const isTyping = false;

  // ─── EVENT HANDLERS ─────────────────────────────────────────────────────────
  // TODO: Handle switching between insights and chat tabs.
  const handleTabChange = (tab: Tab) => setActiveTab(tab);

  // TODO: Handle form submission for the chat bar.
  // Think about: how do you append the user's message to the chat history?
  const handleSendMessage = () => {};

  // TODO: Handle clicking a suggestion chip to auto-send a pre-written question.
  const handleChipClick = () => {};

  // TODO: Handle updating the chat input field.
  const handleInputChange = () => {};

  return (
    <section
      className="min-h-screen bg-bg text-white font-body flex flex-col"
      aria-label="AI Coach"
    >
      {/* ── Header ── */}
      <CoachHeader sessionsAnalyzed={sessionsAnalyzed} />

      {/* ── Tab row ── */}
      <TabNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* ── INSIGHTS TAB ── */}
      {activeTab === "insights" && (
        <InsightsTab
          heroInsight={heroInsight}
          secondaryInsights={secondaryInsights}
        />
      )}

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        isChatbotDisabled ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 pb-20">
            <div className="w-16 h-16 rounded-full bg-raised border border-[#2a2a2a] flex items-center justify-center mb-5">
              <span className="text-2xl">🚧</span>
            </div>
            <h3 className="text-white font-display text-xl tracking-[1px] mb-2">Coming Soon</h3>
            <p className="text-[#888] text-[13px] leading-relaxed max-w-[260px]">
              We're hard at work building the AI Coach chat feature. It'll be ready for you soon!
            </p>
          </div>
        ) : (
          <>
            <ChatTab
              messages={messages}
              isTyping={isTyping}
              suggestionChips={SUGGESTION_CHIPS}
              onChipClick={handleChipClick}
            />

            {/* ── Chat input bar ── */}
            <ChatInputBar
              chatInput={chatInput}
              onInputChange={handleInputChange}
              onSendMessage={handleSendMessage}
            />
          </>
        )
      )}
    </section>
  );
}

/*
─────────────────────────────────────────
ANSWERS (read only after you've thought through the TODOs above)
─────────────────────────────────────────
activeTab             → local state: useState<Tab>('insights')
heroInsight           → GET /api/ai/insights → first item in the response array (highest priority)
secondaryInsights     → GET /api/ai/insights → remaining items after the hero
sessionsAnalyzed      → GET /api/ai/insights → metadata.sessionsAnalyzed count
messages              → local state: useState<ChatMessage[]>([]), persisted per chat session
chatInput             → local state: useState('')
isTyping              → local state: set to true when waiting for AI response, false when stream completes
handleTabChange       → (tab: Tab) => setActiveTab(tab)
handleSendMessage     → POST /api/ai/chat { message: string }, then listen for SSE stream; append user msg immediately, append AI msg as chunks arrive
handleChipClick       → (text: string) => handleSendMessage(text)
handleInputChange     → (e: ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)
─────────────────────────────────────────
*/
