import yt_dlp
import os

# Path to ffmpeg
ffmpeg_path = 'C:/ffmpeg/bin/ffmpeg.exe'

# audio from online video
def audio_online(audio_url, output_audio_file="input_audios.wav"):
    try:
        # Use yt-dlp to download the video and convert audio to WAV using ffmpeg
        ydl_opts = {
            'ffmpeg_location': ffmpeg_path,  # Path to ffmpeg
            'format': 'bestaudio/best',  # Download best audio quality
            'outtmpl': 'temp_audios.%(ext)s',  # Temporary audio file name
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',  # Use FFmpeg to convert the audio format
                'preferredcodec': 'wav',  # Output in WAV format
                'preferredquality': '192',  # You can adjust quality if needed
                'nopostoverwrites': False,  # Allow overwriting of the postprocessed file
            }],
        }

        # Create yt-dlp object and download the video
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"Downloading video from {audio_url}...")
            ydl.download([audio_url])

        # Rename the temporary audio file to desired output name
        temp_audio_file = 'temp_audios.wav'  # Temporary file created by yt-dlp
        if os.path.exists(temp_audio_file):
            os.rename(temp_audio_file, output_audio_file)
            print(f"Audio has been extracted and saved as {output_audio_file}")
            return output_audio_file
        else:
            print("Error: Temporary audio file not found.")

    except Exception as e:
        print(f"An error occurred: {e}")

# Example Usage:
# audio_url = "https://www.youtube.com/watch?v=2eXVly8paZI"  # Replace with your video URL
# output_audio_file = "extracted_audio.wav"  # Specify the output audio file with WAV extension
# download_and_extract_audio(audio_url, output_audio_file)








# audio from local video

def audio_local(video_file):
  from moviepy.editor import VideoFileClip

  # Load the video file
  video = VideoFileClip("videoYT.mp4")

  # Extract the audio from the video
  audio = video.audio

  # Save the extracted audio to a file
  audio.write_audiofile("VideoYT_output_audio.mp3")