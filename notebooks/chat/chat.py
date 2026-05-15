import anthropic
import os
from dotenv import load_dotenv

SYSTEM_MESSAGE = "You are a chatbot. You will have a conversation with a user. Be friendly and concise"

if __name__ == "__main__":
    load_dotenv()
    KEY = os.environ.get('ANTHROPIC_API_KEY')
    MODEL = os.environ.get('MODEL')

    client = anthropic.Anthropic(api_key=KEY)

    print(f"Chatting with {MODEL} model\n")

    historial = []

    while True:
        message = input("> ")
        historial.append({'role': 'user', 'content': message})

        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=SYSTEM_MESSAGE,
            messages=historial,
        )

        reply = response.content[0].text
        historial.append({'role': 'assistant', 'content': reply})
        print(reply)