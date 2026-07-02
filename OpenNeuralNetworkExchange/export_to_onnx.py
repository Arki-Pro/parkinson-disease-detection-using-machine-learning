
import torch
from train import ParkinsonDNN  # Assuming model class is in train.py


input_dim = 22
model = ParkinsonDNN(input_dim)
model.load_state_dict(torch.load("parkinson_model.pth"))
model.eval()

# Export to Microsoft ONNX
dummy_input = torch.randn(1, input_dim)
torch.onnx.export(
    model, 
    dummy_input, 
    "edge_deployment_model.onnx", 
    export_params=True, 
    opset_version=11, 
    do_constant_folding=True,
    input_names=['patient_metrics'], 
    output_names=['parkinson_probability'],
    dynamic_axes={'patient_metrics': {0: 'batch_size'}, 'parkinson_probability': {0: 'batch_size'}}
)
print("ONNX Export Complete.")
