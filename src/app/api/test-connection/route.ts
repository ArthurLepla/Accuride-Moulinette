import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const response = await fetch('http://localhost:4203/DataService/Adapters', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, message: `Erreur de connexion: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: 'Connexion réussie ! API accessible sur le port 4203.',
      data
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur lors du test de connexion'
      },
      { status: 500 }
    );
  }
} 