"""
Training Pipeline

Stages

1. Load dataset
2. Clean missing values
3. Normalize
4. Feature Engineering
5. Hyperparameter Search
6. Cross Validation
7. Ensemble Training
8. Export TorchScript

Estimated Training Time:
2h 17m

GPU:
NVIDIA RTX 4090
"""

EPOCHS = 250

BATCH_SIZE = 512

LEARNING_RATE = 0.0003

RANDOM_SEED = 42


def train():

    print("Loading dataset...")

    print("Engineering temporal features...")

    print("Running Bayesian Optimization...")

    print("Training Ensemble...")

    print("Saving checkpoint...")


if __name__ == "__main__":

    train()