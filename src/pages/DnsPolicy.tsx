import { PanelSectionRow, TextField, ButtonItem, Field } from "@decky/ui";
import { useEffect, useState, FC } from "react";

import { ApiCallBackend, DnsPolicyRule } from "../backend";
import { localizationManager, L } from "../i18n";

export const DnsPolicy: FC = () => {
  const [rules, setRules] = useState<DnsPolicyRule[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveTips, setSaveTips] = useState("");

  useEffect(() => {
    ApiCallBackend.getConfig().then((res) => {
      if (res?.data?.status_code === 200) {
        const loaded = (res.data.dns_policy as DnsPolicyRule[]) || [];
        setRules(loaded);
      }
    });
  }, []);

  const updateRule = (idx: number, patch: Partial<DnsPolicyRule>) => {
    setRules((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const addRule = () => {
    setRules((prev) => [...prev, { domain: "", nameserver: "" }]);
  };

  const deleteRule = (idx: number) => {
    setRules((prev) => prev.filter((_, i) => i !== idx));
  };

  const hasIncompleteRow = rules.some(
    (r) => !r.domain.trim() || !r.nameserver.trim()
  );

  const save = async () => {
    setSaving(true);
    setSaveTips("");
    try {
      const cleaned = rules
        .map((r) => ({
          domain: r.domain.trim(),
          nameserver: r.nameserver.trim(),
        }))
        .filter((r) => r.domain && r.nameserver);
      const res = await ApiCallBackend.setDnsPolicy(cleaned);
      if (res?.status === 200) {
        setSaveTips(localizationManager.getString(L.DNS_POLICY_SAVED));
      } else {
        setSaveTips(localizationManager.getString(L.DNS_POLICY_SAVE_FAILED));
      }
    } catch (e) {
      console.error("setDnsPolicy failed", e);
      setSaveTips(localizationManager.getString(L.DNS_POLICY_SAVE_FAILED));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PanelSectionRow>
        <Field
          label={localizationManager.getString(L.DNS_POLICY_TITLE)}
          description={localizationManager.getString(L.DNS_POLICY_DESC)}
          focusable={false}
        />
      </PanelSectionRow>

      {rules.length === 0 && (
        <PanelSectionRow>
          <Field
            focusable={false}
            description={localizationManager.getString(L.DNS_POLICY_EMPTY_HINT)}
          />
        </PanelSectionRow>
      )}

      {rules.map((rule, idx) => (
        <div key={idx} style={{ display: "contents" }}>
          <PanelSectionRow>
            <TextField
              label={localizationManager.getString(L.DNS_POLICY_DOMAIN)}
              value={rule.domain}
              onChange={(e) =>
                updateRule(idx, { domain: e?.target.value ?? "" })
              }
            />
            <TextField
              label={localizationManager.getString(L.DNS_POLICY_NAMESERVER)}
              value={rule.nameserver}
              onChange={(e) =>
                updateRule(idx, { nameserver: e?.target.value ?? "" })
              }
            />
            <ButtonItem layout="below" onClick={() => deleteRule(idx)}>
              {localizationManager.getString(L.DNS_POLICY_DELETE)}
            </ButtonItem>
          </PanelSectionRow>
        </div>
      ))}

      <PanelSectionRow>
        <ButtonItem layout="below" onClick={addRule}>
          {localizationManager.getString(L.DNS_POLICY_ADD)}
        </ButtonItem>
        <ButtonItem
          layout="below"
          disabled={saving || hasIncompleteRow}
          description={saveTips}
          onClick={save}
        >
          {localizationManager.getString(L.DNS_POLICY_SAVE)}
        </ButtonItem>
      </PanelSectionRow>
    </>
  );
};
