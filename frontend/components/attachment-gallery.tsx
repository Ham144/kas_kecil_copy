"use client";

import { useState } from "react";
import { Download, ExternalLink, FileText, ImageIcon, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  getAttachmentFileName,
  getAttachmentUrl,
  isImageAttachment,
} from "@/lib/attachment";

interface AttachmentGalleryProps {
  attachments?: string[];
  title?: string;
  compact?: boolean;
}

export function AttachmentGallery({
  attachments = [],
  title = "Bukti Transaksi",
  compact = false,
}: AttachmentGalleryProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!attachments.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
        <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          Tidak ada lampiran
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {!compact && (
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <ImageIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{title}</h4>
                <p className="text-xs text-muted-foreground">
                  {attachments.length} file lampiran
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              Klik untuk preview
            </span>
          </div>
        )}

        <div className={`grid gap-3 p-4 ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
          {attachments.map((attachment, index) => {
            const url = getAttachmentUrl(attachment);
            const isImage = isImageAttachment(attachment);
            const fileName = getAttachmentFileName(attachment);

            return (
              <div
                key={`${attachment}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-md"
              >
                {isImage ? (
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(url)}
                    className="block aspect-square w-full overflow-hidden bg-muted"
                  >
                    <img
                      src={url}
                      alt={`Lampiran ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                ) : (
                  <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-muted/50 p-4">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <span className="max-w-full truncate px-2 text-xs text-muted-foreground">
                      {fileName}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 border-t border-border p-3">
                  <span className="truncate text-xs font-medium text-foreground">
                    Bukti {index + 1}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                      title="Buka"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href={url}
                      download
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog.Root open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <Dialog.Title className="text-sm font-semibold text-foreground">
                Preview Lampiran
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
            {previewUrl && (
              <div className="flex max-h-[calc(90vh-56px)] items-center justify-center bg-muted/30 p-4">
                <img
                  src={previewUrl}
                  alt="Preview lampiran"
                  className="max-h-[calc(90vh-80px)] max-w-full rounded-lg object-contain"
                />
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
