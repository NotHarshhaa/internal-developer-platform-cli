import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, template, ci, deploy, gitops, docker, k8s, monitoring, docs, outputDir } = body;

    if (!name || !template) {
      return NextResponse.json(
        { success: false, error: "Service name and template are required" },
        { status: 400 }
      );
    }

    // Build the CLI command
    const parts = ["idp-cli", "create-service", name, "--template", template];

    if (ci && ci !== "github-actions") {
      parts.push("--ci", ci);
    }
    if (deploy && deploy !== "kubernetes") {
      parts.push("--deploy", deploy);
    }
    if (gitops && gitops !== "none") {
      parts.push("--gitops", gitops);
    }
    if (docker === false) parts.push("--no-docker");
    if (k8s === false) parts.push("--no-k8s");
    if (monitoring === false) parts.push("--no-monitoring");
    if (docs === false) parts.push("--no-docs");

    if (outputDir) {
      parts.push("--output-dir", outputDir);
    }

    const command = parts.join(" ");

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000,
      cwd: outputDir || process.cwd(),
    });

    return NextResponse.json({
      success: true,
      message: `Service '${name}' created successfully with template '${template}'`,
      output: stdout,
      command,
    });
  } catch (error: unknown) {
    const err = error as { message?: string; stderr?: string };
    const errorMessage = err.stderr || err.message || "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
