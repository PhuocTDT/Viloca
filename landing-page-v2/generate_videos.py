import cv2
import numpy as np
import os
import math

def create_cinematic_drone_video(image_path, output_path, duration_sec=8, fps=30, width=1920, height=1080):
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error loading {image_path}")
        return False
    
    orig_h, orig_w = img.shape[:2]
    total_frames = int(duration_sec * fps)
    
    # We use mp4v fourcc
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    if not out.isOpened():
        print(f"Failed to open VideoWriter for {output_path}")
        return False
    
    print(f"Generating video {output_path} ({total_frames} frames)...")
    
    # We will do a smooth forward drone drift:
    # Scale goes from 1.05 to 1.18 and slight y pan
    for i in range(total_frames):
        # Progress 0 to 1 with smooth cosine easing
        t = i / total_frames
        # Smooth ease in out loop: 0 -> 1 -> 0
        ease = (1 - math.cos(2 * math.pi * t)) / 2.0  # seamless loop!
        
        scale = 1.04 + 0.10 * ease
        
        # Crop region
        crop_w = int(orig_w / scale)
        crop_h = int(orig_h / scale)
        
        # Drift slightly upwards as we move in
        center_x = orig_w // 2
        center_y = int(orig_h * (0.50 - 0.04 * ease))
        
        x1 = max(0, min(orig_w - crop_w, center_x - crop_w // 2))
        y1 = max(0, min(orig_h - crop_h, center_y - crop_h // 2))
        x2 = x1 + crop_w
        y2 = y1 + crop_h
        
        cropped = img[y1:y2, x1:x2]
        frame = cv2.resize(cropped, (width, height), interpolation=cv2.INTER_LANCZOS4)
        
        # Subtle organic warm light breathing (golden hour pulse)
        glow = 1.0 + 0.02 * math.sin(2 * math.pi * t)
        if glow != 1.0:
            frame = np.clip(frame.astype(np.float32) * glow, 0, 255).astype(np.uint8)
            
        out.write(frame)
        
    out.release()
    print(f"Successfully generated {output_path}")
    return True

if __name__ == "__main__":
    media_dir = r"d:\Desktop\Viloca\landing-page-v2\media"
    
    create_cinematic_drone_video(
        os.path.join(media_dir, "hero.jpg"),
        os.path.join(media_dir, "hero.mp4"),
        duration_sec=8, fps=30, width=1920, height=1080
    )
    
    create_cinematic_drone_video(
        os.path.join(media_dir, "story-culture.jpg"),
        os.path.join(media_dir, "story-culture.mp4"),
        duration_sec=6, fps=30, width=1920, height=1080
    )
    
    create_cinematic_drone_video(
        os.path.join(media_dir, "story-nature.jpg"),
        os.path.join(media_dir, "story-nature.mp4"),
        duration_sec=6, fps=30, width=1920, height=1080
    )
    
    create_cinematic_drone_video(
        os.path.join(media_dir, "story-people.jpg"),
        os.path.join(media_dir, "story-people.mp4"),
        duration_sec=6, fps=30, width=1920, height=1080
    )
