import "./index.css";
import { Composition } from "remotion";
import { AgentUserOverview } from "./compositions/AgentUserOverview";
import { AgentToolFlow, agentToolFlowStore } from "./compositions/AgentToolFlow";
import {
  AgentToolFlowContext,
  AgentToolFlowContextToken,
  agentToolFlowContextStore,
  agentToolFlowContextTokenStore,
} from "./compositions/AgentToolFlowContext";
import {
  AgentSkillFlow,
  agentSkillFlowStore,
} from "./compositions/AgentSkillFlow";
import {
  AgentSystemPromptFlow,
  agentSystemPromptFlowStore,
} from "./compositions/AgentSystemPromptFlow";
import {
  AgentChatFlowFalse,
  AgentChatFlowTrue,
  AgentChatFlowTrueAbstract,
  agentChatFlowFalseStore,
  agentChatFlowTrueStore,
  agentChatFlowTrueAbstractStore,
} from "./compositions/AgentChatFlow";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AgentUserOverview"
        component={AgentUserOverview}
        durationInFrames={150}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="AgentToolFlow"
        component={AgentToolFlow}
        durationInFrames={agentToolFlowStore.frameTotal}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="AgentToolFlowContext"
        component={AgentToolFlowContext}
        durationInFrames={agentToolFlowContextStore.frameTotal}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="AgentToolFlowContextToken"
        component={AgentToolFlowContextToken}
        durationInFrames={agentToolFlowContextTokenStore.frameTotal}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="AgentSkillFlow"
        component={AgentSkillFlow}
        durationInFrames={agentSkillFlowStore.frameTotal}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="AgentSystemPromptFlow"
        component={AgentSystemPromptFlow}
        durationInFrames={agentSystemPromptFlowStore.frameTotal}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="AgentChatFlowFalse"
        component={AgentChatFlowFalse}
        durationInFrames={agentChatFlowFalseStore.frameTotal}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="AgentChatFlowTrue"
        component={AgentChatFlowTrue}
        durationInFrames={agentChatFlowTrueStore.frameTotal}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="AgentChatFlowTrueAbstract"
        component={AgentChatFlowTrueAbstract}
        durationInFrames={agentChatFlowTrueAbstractStore.frameTotal}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
