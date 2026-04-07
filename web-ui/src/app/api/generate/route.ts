import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { platform } from "os";
import fs from "fs";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      template, 
      ci, 
      deploy, 
      gitops, 
      docker, 
      k8s, 
      monitoring, 
      docs, 
      outputDir,
      port,
      envVars,
      resources,
      replicas,
      healthCheck,
      dependencies
    } = body;

    // Validation
    if (!name || !template) {
      return NextResponse.json(
        { success: false, error: "Service name and template are required" },
        { status: 400 }
      );
    }

    // Validate service name format
    if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(name)) {
      return NextResponse.json(
        { success: false, error: "Service name must start with a letter and contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // Validate port range
    if (port && (port < 1024 || port > 65535)) {
      return NextResponse.json(
        { success: false, error: "Port must be between 1024 and 65535" },
        { status: 400 }
      );
    }

    // Build the CLI command using Python module execution
    const rootPath = path.resolve(process.cwd(), "..");
    const parts = ["python", "-m", "idp_cli.cli", "create-service", name, "--template", template];

    // CI/CD and deployment options
    if (ci && ci !== "github-actions") {
      parts.push("--ci", ci);
    }
    if (deploy && deploy !== "kubernetes") {
      parts.push("--deploy", deploy);
    }
    if (gitops && gitops !== "none") {
      parts.push("--gitops", gitops);
    }

    // Feature flags
    if (docker === false) parts.push("--no-docker");
    if (k8s === false) parts.push("--no-k8s");
    if (monitoring === false) parts.push("--no-monitoring");
    if (docs === false) parts.push("--no-docs");

    // Service configuration
    if (outputDir) {
      parts.push("--output-dir", outputDir);
    }

    // Note: The following configurations are stored but not passed to CLI
    // They can be used for post-processing or manual configuration:
    // - port, replicas, envVars, resources
    // These would need to be applied manually to the generated K8s manifests

    const command = parts.join(" ");
    const execOptions: any = {
      timeout: 30000,
      cwd: rootPath, // Always execute from root directory
      env: { 
        ...process.env, 
        PYTHONPATH: rootPath,
        PYTHONIOENCODING: "utf-8",
        PYTHONLEGACYWINDOWSSTDIO: "utf-8"
      },
    };

    console.log("Executing command:", command);
    console.log("Working directory:", execOptions.cwd);
    console.log("Platform:", platform());

    // Execute the CLI command
    const { stdout, stderr } = await execAsync(command, execOptions);

    // Extract generated files list
    const generatedFiles: string[] = [];
    const outputPath = path.join(rootPath, outputDir || "./output", name);
    
    try {
      // Recursively get all files in the output directory
      const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []): string[] => {
        const files = fs.readdirSync(dirPath);
        
        files.forEach((file) => {
          const filePath = path.join(dirPath, file);
          if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
          } else {
            // Store relative path from service root
            const relativePath = path.relative(outputPath, filePath);
            arrayOfFiles.push(relativePath.replace(/\\/g, '/'));
          }
        });
        
        return arrayOfFiles;
      };
      
      if (fs.existsSync(outputPath)) {
        generatedFiles.push(...getAllFiles(outputPath));
      }
    } catch (fileError) {
      console.warn("Could not read generated files:", fileError);
    }

    return NextResponse.json({
      success: true,
      message: `Service '${name}' created successfully with template '${template}'`,
      output: stdout || "Service generated successfully!",
      command,
      files: generatedFiles,
      stats: {
        filesGenerated: generatedFiles.length,
        outputPath: outputPath,
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string; stderr?: string; code?: string };
    let errorMessage = err.stderr || err.message || "Unknown error occurred";
    
    // Provide more helpful error messages
    if (err.code === "ENOENT") {
      errorMessage = "Python or IDP CLI not found. Please ensure Python is installed and the IDP CLI is available.";
    } else if (err.message?.includes("timeout")) {
      errorMessage = "Service generation timed out. The service might be too complex or the system is slow.";
    } else if (err.stderr?.includes("ModuleNotFoundError")) {
      errorMessage = "IDP CLI module not found. Please ensure the CLI is properly installed.";
    }

    console.error("Generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: err.stderr || err.message,
      },
      { status: 500 }
    );
  }
}
