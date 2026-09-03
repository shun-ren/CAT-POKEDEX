"""Export a reviewed candidate without overwriting CATDEX's current browser model."""
import argparse
import shutil
from pathlib import Path

import torch
from torch import nn
from torchvision import models


class BrowserResNet(nn.Module):
    def __init__(self, model):
        super().__init__(); self.model = model
    def forward(self, images): return self.model(images)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--checkpoint', type=Path, required=True)
    parser.add_argument('--labels', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=Path('ml/output/cat-breed-candidate.onnx'))
    args = parser.parse_args(); args.output.parent.mkdir(parents=True, exist_ok=True)
    checkpoint = torch.load(args.checkpoint, map_location='cpu', weights_only=False)
    model = models.resnet18(weights=None); model.fc = nn.Linear(model.fc.in_features, len(checkpoint['classes'])); model.load_state_dict(checkpoint['state_dict']); model.eval()
    torch.onnx.export(BrowserResNet(model), torch.zeros(1, 3, 224, 224), args.output, input_names=['input'], output_names=['logits'], dynamic_axes={'input': {0: 'batch'}, 'logits': {0: 'batch'}}, opset_version=17)
    shutil.copyfile(args.labels, args.output.with_name('cat-breed-labels.json'))
    print(f'Candidate written to {args.output}. Review test metrics before copying it into build/models/.')


if __name__ == '__main__':
    main()
