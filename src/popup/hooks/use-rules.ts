import { useState, useEffect, useCallback } from "react";
import { RuleState, MessageType } from "../../types";
import { sendExtensionMessage } from "../utils/send-extension-message";

export const useRules = (url: URL | null) => {
  const [ruleState, setRuleState] = useState<RuleState | null>(null);

  const fetchRules = useCallback(async () => {
    if (!url) return;
    try {
      const response = await sendExtensionMessage({ type: MessageType.GET_RULE_FOR_TAB });
      setRuleState(response?.ruleState ?? null);
    } catch (e) {
      console.error("Failed to fetch rules:", e);
    }
  }, [url]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const togglePageRule = async (targetUrl: string) => {
    if (ruleState?.hasPageRule) {
      await sendExtensionMessage({ type: MessageType.REMOVE_RULE, ruleType: "page", url: targetUrl });
    } else {
      await sendExtensionMessage({ type: MessageType.ADD_RULE, ruleType: "page", url: targetUrl });
    }
    await fetchRules();
  };

  const toggleDomainRule = async (targetUrl: string) => {
    if (ruleState?.hasDomainRule) {
      await sendExtensionMessage({ type: MessageType.REMOVE_RULE, ruleType: "domain", url: targetUrl });
    } else {
      await sendExtensionMessage({ type: MessageType.ADD_RULE, ruleType: "domain", url: targetUrl });
    }

    await fetchRules();
  };

  return { ruleState, togglePageRule, toggleDomainRule };
};
