# audio extract

import speech_recognition as sr
import subprocess
from os import path
import os
# AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), "VideoYT_output_audio.mp3") # works with webm,mp3

# MONO_AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), "mono_extracted_audio.wav")  # Output path for mono audio

def convert_to_mono(input_file, output_file):
    subprocess.run([
        'C:/ffmpeg/bin/ffmpeg.exe', '-i', input_file, 
        '-ac', '1',  
        output_file
    ])
def get_audio_format_by_extension(file_path):
    print("file path:", file_path)
    _, ext = path.splitext(file_path)
    return ext.lower().strip('.') 

def main(audio_file):
    mono_audio_file = path.join(path.dirname(path.realpath(__file__)), "mono_extracted_audio.wav")  # Output path for mono audio
    typeOfFile = get_audio_format_by_extension(audio_file)
    if typeOfFile != "wav":
        convert_to_mono(audio_file,mono_audio_file)
    else:
        mono_audio_file = audio_file 
    r = sr.Recognizer()
    with sr.AudioFile(mono_audio_file) as source:
        audio = r.record(source)  
    try:
        text = r.recognize_google(audio)
        print('Converting audio transcripts into text ...')
        # print(text)
        return text

    except sr.UnknownValueError:
        print('Google Speech Recognition could not understand the audio.')
    except sr.RequestError as e:
        print(f'Sorry, there was an issue with the request: {e}')
    except Exception as e:
        print(f'Sorry.. an error occurred: {e}')