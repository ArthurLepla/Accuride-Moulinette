## SpecStory

## Debugging API Route 404 Error in Next.js (2/11/2025, 5:24:41 PM)

_**User**_

Okay, mais à tu identifier pourquoi le formulaire n'utilise pas @route.ts ?
Source map error: Error: request failed with status 404
Stack in the worker:networkRequest@resource://devtools/client/shared/source-map-loader/utils/network-request.js:43:9

Resource URL: http://localhost:3000/%3Canonymous%20code%3E
Source Map URL: installHook.js.map
Réponse brute de l'API: 
Object { adapters: (3) […] }
page.tsx:2004:33
Adapters traités: 
Array(3) [ {…}, {…}, {…} ]
page.tsx:2035:37
XHRGET
http://localhost:3000/api/adapters/79894682fe424b409d954bd6cf0fda6b/browse
[HTTP/1.1 404 Not Found 28ms]

Erreur lors du chargement des connectionNames: Error: Erreur 404: Not Found
    captureStackTrace webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/internal/helpers/capture-stack-trace.js:13
    error webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/globals/intercept-console-error.js:51
    loadConnectionNames webpack-internal:///(app-pages-browser)/./src/app/sandbox/page.tsx:183
    useEffect webpack-internal:///(app-pages-browser)/./src/app/sandbox/page.tsx:191
    frame webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:22420
    runWithFiberInDEV webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:544
    commitHookEffectListMount webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:10732
<anonymous code>:1:145535

---

_**Assistant**_

D'après l'erreur que vous décrivez et le code fourni, je peux identifier plusieurs problèmes potentiels :

1. L'erreur 404 indique que la route `/api/adapters/[id]/browse` n'est pas correctement configurée ou accessible. En examinant le code, je vois que le fichier route.ts existe mais il y a peut-être un problème avec la structure des dossiers ou la configuration Next.js.

2. Dans le code de la route API :

```1:75:src/app/api/adapters/[id]/browse/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    const headersList = await headers();
    const authConfig = headersList.get('x-auth-config');
    
    if (!authConfig) {
      console.error('Configuration d\'authentification manquante');
      return NextResponse.json(
        { error: 'Configuration d\'authentification manquante' },
        { status: 401 }
      );
    }

    const config = JSON.parse(authConfig);
    const adapterId = params.id;

    console.log('Debug - Paramètres reçus:', { 
      adapterId,
      params,
      url: request.url
    });

    console.log('Récupération des connectionNames pour l\'adapter:', adapterId);
    
    const apiUrl = `https://${config.iedIp}/DataService/Adapters/${adapterId}/browse`;
    console.log('Tentative de connexion à:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.authToken}`
      }
    });

    console.log('Statut de la réponse:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        errorText: errorText
      });
      throw new Error(`Erreur lors de la récupération des connectionNames (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Données reçues de l\'API:', data);
    
    // Réactiver la vérification SSL
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    return NextResponse.json(data);
  }
    // Réactiver la vérification SSL en cas d'erreur
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    console.error('Erreur lors de la récupération des connectionNames:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
```


La route est correctement définie, mais il y a un problème dans la gestion des erreurs - il manque un bloc `catch` complet.

3. Dans le composant qui fait l'appel :

```187:252:src/app/sandbox/page.tsx
  // Charger les connectionNames quand un adapter est sélectionné
  useEffect(() => {
    const loadConnectionNames = async () => {
      if (!selectedConnection) {
        setConnectionNames([]);
        setSelectedConnectionName('');
        setError(null);
        return;
      }

      setIsLoadingConnectionNames(true);
      setError(null);

      try {
        const authConfig = getAuthConfig();
        if (!authConfig) {
          setError('Configuration d\'authentification manquante');
          return;
        }

        const response = await fetch(`/api/adapters/${selectedConnection}/browse`, {
          headers: {
            'X-Auth-Config': JSON.stringify(authConfig)
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Réponse de browse:', data);
        
        // Vérifier si nous avons des tags dans la réponse
        if (!data || !data.tags || !Array.isArray(data.tags)) {
          setError('Format de réponse invalide');
          setConnectionNames([]);
          return;
        }

        // Extraire les connectionNames uniques des tags
        const uniqueConnectionNames = Array.from(new Set(
          data.tags
            .filter((tag: any) => tag && typeof tag === 'object' && tag.connectionName)
            .map((tag: any) => tag.connectionName)
        )) as string[];

        console.log('ConnectionNames trouvés:', uniqueConnectionNames);
        setConnectionNames(uniqueConnectionNames);

        // Si nous n'avons trouvé aucun connectionName
        if (uniqueConnectionNames.length === 0) {
          setError('Aucune connection disponible pour cet adapter');
        }
      }
        console.error('Erreur lors du chargement des connectionNames:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
        setConnectionNames([]);
      } finally {
        setIsLoadingConnectionNames(false);
      }
    };

    loadConnectionNames();
  }, [selectedConnection]);
```


L'appel à l'API est correct, mais il y a un problème dans la gestion de la réponse.

Pour résoudre ce problème, je suggère de :

1. Vérifier que la structure des dossiers est correcte :
```
src/
  app/
    api/
      adapters/
        [id]/
          browse/
            route.ts
```

2. Corriger la gestion des erreurs dans le fichier route.ts :

```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    const headersList = await headers();
    const authConfig = headersList.get('x-auth-config');
    
    if (!authConfig) {
      console.error('Configuration d\'authentification manquante');
      return NextResponse.json(
        { error: 'Configuration d\'authentification manquante' },
        { status: 401 }
      );
    }

    // ... reste du code ...

  } catch (error) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.error('Erreur lors de la récupération des connectionNames:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  } finally {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  }
}
```

3. Vérifier que Next.js est configuré pour gérer les routes API dynamiques dans le fichier `next.config.js`.

4. Assurez-vous que l'ID de l'adaptateur passé dans l'URL est valide et correspond à un adaptateur existant.

5. Vérifiez les logs du serveur Next.js pour voir s'il y a des erreurs supplémentaires qui pourraient indiquer pourquoi la route n'est pas trouvée.

Le problème principal semble être que Next.js ne trouve pas la route API, ce qui suggère soit un problème de configuration, soit un problème de structure des dossiers.

---



---

