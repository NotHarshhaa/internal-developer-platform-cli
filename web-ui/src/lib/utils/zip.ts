import JSZip from "jszip";
import { GeneratedFile } from "../generators/base";

export async function createZip(files: GeneratedFile[], serviceName: string): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}

export function downloadZip(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
