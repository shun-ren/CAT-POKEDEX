"""Export a reviewed candidate without overwriting CATDEX's current browser model."""
import argparse
import json
import shutil
from pathlib import Path

import numpy as np
import onnx
import onnxruntime as ort
import torch
from torch import nn
from torchvision import models


class BrowserResNet(nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model

    def forward(self, images):
        return self.model(images)


def labels_output_path(model_path):
    model_name = model_path.stem.removesuffix('-candidate')
    return model_path.with_name(f'{model_name}-labels.json')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--checkpoint', type=Path, required=True)
    parser.add_argument('--labels', type=Path, required=True)
    parser.add_argument(
        '--output',
        type=Path,
        default=Path('ml/output/cat-breed-candidate.onnx'),
    )
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)

    checkpoint = torch.load(args.checkpoint, map_location='cpu', weights_only=False)
    classes = checkpoint['classes']
    labels = json.loads(args.labels.read_text(encoding='utf-8'))
    if labels != classes:
        raise SystemExit('The labels file does not match the checkpoint classes.')

    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, len(classes))
    model.load_state_dict(checkpoint['state_dict'])
    model.eval()

    example = torch.zeros(1, 3, 224, 224)
    torch.onnx.export(
        BrowserResNet(model),
        example,
        args.output,
        input_names=['input'],
        output_names=['logits'],
        dynamic_axes={'input': {0: 'batch'}, 'logits': {0: 'batch'}},
        opset_version=17,
        dynamo=False,
    )

    onnx.checker.check_model(onnx.load(args.output))
    session = ort.InferenceSession(str(args.output), providers=['CPUExecutionProvider'])
    logits = session.run(None, {'input': np.zeros((1, 3, 224, 224), dtype=np.float32)})[0]
    if logits.shape != (1, len(classes)):
        raise RuntimeError(f'Unexpected exported output shape: {logits.shape}')

    labels_output = labels_output_path(args.output)
    shutil.copyfile(args.labels, labels_output)
    print(f'Validated candidate written to {args.output}.')
    print(f'Labels written to {labels_output}.')
    print('Review test metrics before copying either file into build/models/.')


if __name__ == '__main__':
    main()
