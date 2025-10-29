import { useState, useEffect } from "react";
import { ImageUploader } from "../components/ImageUploader";
import { VoiceRecorder } from "../components/VoiceRecorder";
import { ListingPreview } from "../components/ListingPreview";
import {
  ImageData,
  VoiceData,
  ProductFacts,
  ListingContent,
  ToneVariant,
  VideoScript,
} from "../lib/chromeBuiltInAi";
import {
  generateFactsFromImageAndVoice,
  generateTitleAndDescription,
  generateVariants,
  proofreadText,
  translateText,
  summarizeVoiceNote,
} from "../lib/chromeBuiltInAi";
import { saveListing, generateListingId } from "../lib/indexeddb";
import type { ImageData as ImageDataType } from "../lib/chromeBuiltInAi";
import { suggestPrice } from "../utils/promptBuilders";

export function Editor() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [voiceNote, setVoiceNote] = useState<VoiceData | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [_facts, setFacts] = useState<ProductFacts | null>(null);
  const [content, setContent] = useState<ListingContent | null>(null);
  const [variants, setVariants] = useState<ToneVariant[]>([]);
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);
  const [selectedTone, setSelectedTone] = useState<
    "original" | "friendly" | "premium" | "bargain"
  >("original");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ur">("en");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [translatedContent, setTranslatedContent] =
    useState<ListingContent | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (selectedLanguage !== "en" && content) {
      translateContent();
    } else {
      setTranslatedContent(null);
    }
  }, [selectedLanguage, content]);

  const translateContent = async () => {
    if (!content || selectedLanguage === "en") return;

    try {
      const translatedTitle = await translateText(
        content.title,
        selectedLanguage
      );
      const translatedDesc = await translateText(
        content.description,
        selectedLanguage
      );
      setTranslatedContent({
        ...content,
        title: translatedTitle,
        description: translatedDesc,
      });
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setIsGenerating(true);
    setProgress("Analyzing images...");

    try {
      // Step 1: Extract facts from images and voice
      const extractedFacts = await generateFactsFromImageAndVoice(
        images,
        voiceNote
      );
      setFacts(extractedFacts);
      setProgress("Generating listing content...");

      // Step 2: Generate title and description
      const listingContent = await generateTitleAndDescription(
        extractedFacts,
        true
      );
      const price = suggestPrice(extractedFacts);
      listingContent.suggestedPrice = price || listingContent.suggestedPrice;
      setContent(listingContent);
      setProgress("Generating tone variants...");

      // Step 3: Generate tone variants
      const toneVariants = await generateVariants(listingContent);
      setVariants(toneVariants);
      setProgress("Creating video script...");

      // Step 4: Generate video script if voice note exists
      let finalVideoScript: VideoScript | null = null;
      if (voiceNote) {
        const scriptData = await summarizeVoiceNote(voiceNote, extractedFacts);
        finalVideoScript = scriptData.videoScript;
        setVideoScript(scriptData.videoScript);
      }

      // Step 5: Proofread
      setProgress("Proofreading...");
      const proofreadTitle = await proofreadText(listingContent.title);
      const proofreadDesc = await proofreadText(listingContent.description);
      const finalContent = {
        ...listingContent,
        title: proofreadTitle,
        description: proofreadDesc,
      };
      setContent(finalContent);

      // Step 6: Save to IndexedDB
      const listingId = generateListingId();
      await saveListing({
        id: listingId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        images: images as ImageDataType[],
        voiceNote,
        content: finalContent,
        facts: extractedFacts,
        variants: toneVariants,
        videoScript: finalVideoScript,
      });

      setProgress("Complete!");
      setTimeout(() => setProgress(""), 2000);
    } catch (error) {
      console.error("Generation error:", error);
      alert("Error generating listing. Please try again.");
      setProgress("");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentContent = translatedContent || content;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">MarketMate</h1>
          <div className="flex items-center gap-3">
            {isOffline && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Offline Mode
              </span>
            )}
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2a3 3 0 006 0V7a3 3 0 00-6 0v2z"
                  clipRule="evenodd"
                />
              </svg>
              Processed locally — nothing leaves your device
            </span>
          </div>
        </div>

        {/* Image Upload */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Product Images</h2>
          <ImageUploader images={images} onImagesChange={setImages} />
        </section>

        {/* Voice Recording */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Voice Note (Optional)</h2>
          <VoiceRecorder
            voiceNote={voiceNote}
            onVoiceNoteChange={setVoiceNote}
          />
        </section>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || images.length === 0}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-lg font-semibold rounded-lg transition-colors shadow-lg"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {progress || "Generating..."}
              </span>
            ) : (
              "Generate Listing"
            )}
          </button>
        </div>

        {/* Preview */}
        {currentContent && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Listing Preview</h2>
            <ListingPreview
              content={currentContent}
              variants={variants}
              videoScript={videoScript || undefined}
              selectedTone={selectedTone}
              selectedLanguage={selectedLanguage}
              onToneChange={setSelectedTone}
              onLanguageChange={setSelectedLanguage}
            />
          </section>
        )}
      </div>
    </div>
  );
}
