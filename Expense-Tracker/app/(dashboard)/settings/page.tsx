"use client";

import { getUserSettings, updateUserSettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import type { UserSettings } from "@/types/database.types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getUserSettings();
      setSettings(data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      await updateUserSettings({
        monthly_budget: settings.monthly_budget,
        currency: settings.currency,
        start_of_week: settings.start_of_week,
        notifications_enabled: settings.notifications_enabled,
      });
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading settings...</div>;
  }

  if (!settings) {
    return <div className="text-center py-12">Failed to load settings</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and budget settings</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="monthly_budget" className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Budget
              </label>
              <Input
                id="monthly_budget"
                type="number"
                value={settings.monthly_budget}
                onChange={(e) =>
                  setSettings({ ...settings, monthly_budget: Number(e.target.value) })
                }
                min="0"
                step="100"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Set your monthly spending budget to track expenses
              </p>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency Symbol
              </label>
              <Input
                id="currency"
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                maxLength={10}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Currency symbol to display (e.g., ₹, $, €)
              </p>
            </div>

            <div>
              <label htmlFor="start_of_week" className="block text-sm font-medium text-gray-700 mb-2">
                Start of Week
              </label>
              <select
                id="start_of_week"
                value={settings.start_of_week}
                onChange={(e) =>
                  setSettings({ ...settings, start_of_week: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="6">Saturday</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose which day starts your week for weekly reports
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="notifications_enabled"
                type="checkbox"
                checked={settings.notifications_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, notifications_enabled: e.target.checked })
                }
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="notifications_enabled" className="text-sm font-medium text-gray-700">
                Enable Notifications
              </label>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
