import { useState } from "react";
import {
  ListingContent,
  ToneVariant,
  VideoScript,
} from "../lib/chromeBuiltInAi";

interface ListingPreviewProps {
  content: ListingContent;
  variants?: ToneVariant[];
  videoScript?: VideoScript;
  selectedTone?: "original" | "friendly" | "premium" | "bargain";
  selectedLanguage?: "en" | "ur";
  onToneChange?: (
    tone: "original" | "friendly" | "premium" | "bargain"
  ) => void;
  onLanguageChange?: (lang: "en" | "ur") => void;
  onCopy?: () => void;
  onExport?: () => void;
}

export function ListingPreview({
  content,
  variants = [],
  videoScript,
  selectedTone = "original",
  selectedLanguage = "en",
  onToneChange,
  onLanguageChange,
  onCopy,
  onExport,
}: ListingPreviewProps) {
  const [copied, setCopied] = useState(false);

  const variant =
    selectedTone !== "original"
      ? variants.find((v) => v.tone === selectedTone)
      : null;

  const displayTitle = variant?.title || content.title;
  const displayDescription = variant?.description || content.description;
  // Always use original content for keywords and price
  const displayKeywords = content.keywords;
  const displayPrice = content.suggestedPrice;

  const handleCopy = async () => {
    const textToCopy = `${displayTitle}\n\n${displayDescription}\n\nKeywords: ${displayKeywords.join(
      ", "
    )}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleExport = () => {
    const exportData = {
      title: displayTitle,
      description: displayDescription,
      keywords: displayKeywords,
      price: displayPrice,
      tone: selectedTone,
      language: selectedLanguage,
      videoScript,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketplace-listing-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.();
  };

  const handleFacebookMarketplace = () => {
    // Facebook Marketplace URL with prefilled parameters (if supported)
    const params = new URLSearchParams({
      title: displayTitle,
      description: displayDescription,
      price: displayPrice?.toString() || "",
    });
    window.open(
      `https://www.facebook.com/marketplace/create/item?${params.toString()}`,
      "_blank"
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-2">
          {variants.length > 0 && onToneChange && (
            <select
              value={selectedTone}
              onChange={(e) => onToneChange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="original">Original</option>
              <option value="friendly">Friendly</option>
              <option value="premium">Premium</option>
              <option value="bargain">Bargain</option>
            </select>
          )}
          {onLanguageChange && (
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="en">English</option>
              <option value="ur">Urdu</option>
            </select>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
          >
            Export JSON
          </button>
          <button
            onClick={handleFacebookMarketplace}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            Open Facebook
          </button>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {displayTitle}
            </h2>
            {displayPrice && (
              <p className="text-3xl font-bold text-primary-600">
                ${displayPrice}
              </p>
            )}
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">
              {displayDescription}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {displayKeywords.map((keyword: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Video Script */}
      {videoScript && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            Video Script ({videoScript.duration}s)
          </h3>
          <p className="text-gray-700 whitespace-pre-line mb-4">
            {videoScript.script}
          </p>
          {videoScript.keyPoints.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Key Points:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {videoScript.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
