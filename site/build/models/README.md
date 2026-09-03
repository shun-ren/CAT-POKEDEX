# Local breed model

`cat-breed-resnet18.onnx` is the MIT-licensed `Cat_Dog_Breeds.ONNX` ResNet18 model published by Scott Mueller and trained on the Oxford-IIIT Pet dataset.

- Source: https://huggingface.co/ScottMueller/Cat_Dog_Breeds.ONNX
- Dataset: https://robots.ox.ac.uk/~vgg/data/pets/
- Runtime: ONNX Runtime Web 1.29.0

The exported model has a fixed input shape of `[10, 3, 224, 224]`; CATDEX repeats the same image across the ten-item batch and reads the first output. It recognises the 37 Oxford-IIIT Pet categories, including 12 cat breeds. It does not contain Domestic Shorthair, mixed ancestry, or an open-set unknown class, so the UI must continue describing its output as a visual estimate.
