import type { DeploymentProgress, DeploymentRequest } from "../types";

export interface DeploymentService {
  deploy(request: DeploymentRequest, onProgress: (progress: DeploymentProgress) => void): Promise<DeploymentProgress>;
}

export class MockDeploymentService implements DeploymentService {
  async deploy(request: DeploymentRequest, onProgress: (progress: DeploymentProgress) => void): Promise<DeploymentProgress> {
    if (!request.gameId || !request.robotId) throw new Error("Select a game and compatible robot.");
    const deploymentId = `DEP-${Date.now().toString().slice(-6)}`;
    const steps: readonly Omit<DeploymentProgress,"deploymentId">[] = [
      {progress:8,stage:"queued"},{progress:24,stage:"validating"},{progress:52,stage:"uploading"},{progress:78,stage:"installing"},{progress:100,stage:"complete"}
    ];
    for (const step of steps) {
      await new Promise<void>(resolve => setTimeout(resolve, 420));
      onProgress({deploymentId,...step});
    }
    return {deploymentId,progress:100,stage:"complete"};
  }
}
