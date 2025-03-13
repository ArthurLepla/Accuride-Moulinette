## SpecStory

## Pousser vers le dépôt GitHub MoulinetteGenerique (3/6/2025, 9:22:52 AM)

_**User**_

je voudrais push tout ceci sur mon nouveau github, j'ai créer ce repo : MoulinetteGenerique

Mais c'est sur un nouveau compte github.

---

_**Assistant**_

<think>The user wants to push their code to a new GitHub repository they've created called "MoulinetteGenerique" on a new GitHub account. I need to help them set up the remote repository and push their code to it.

Here's what I'll need to do:
1. Check if there's already a Git repository initialized in the current directory
2. If not, initialize one
3. Add all files to the staging area
4. Commit the files
5. Add the new GitHub repository as a remote
6. Push the code to the new repository

Since this is a new GitHub account, they might need to set up their GitHub credentials and authentication for this repository as well.</think>I'll help you push your code to your new GitHub repository. Let's start by checking the current state of your Git repository and then set up the connection to your new GitHub repo.

---

_****_

```bash
git status
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>git
 status
Microsoft Windows [version 10.0.19045.5487]
(c) Microsoft Corporation. Tous droits réservés.

C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>g
it status






















On branch feature/mendix-generator
Your branch is up to date with 'origin/feature/mendix-generator'.

Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        deleted:    iih-essentials.public-1.8.0.openapi.json
        modified:   src/app/api/aggregations/route.ts
        deleted:    src/app/api/assets/[assetId]/route.ts
        deleted:    src/app/api/assets/[assetId]/variables/route.ts
        modified:   src/app/api/assets/root/route.ts
        deleted:    src/app/api/variables/[assetId]/route.ts
        modified:   src/app/api/variables/route.ts
        modified:   src/app/configure-ied/page.tsx
        modified:   src/app/mendix-generator/page.tsx
        modified:   src/app/mendix-generator/utils/codeGenerator.ts
        modified:   src/components/ImportValidationModal.tsx
        modified:   src/components/layout/Sidebar.tsx
        modified:   src/lib/flexible-hierarchy-processor.ts
        modified:   src/lib/flexibleAssetImporter.ts
        modified:   src/services/asset-service.ts

Untracked files:
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>
```

---

_****_

I see you already have a Git repository set up with a branch called `feature/mendix-generator`. Now let's add your new GitHub repository as a remote and push your code there. First, let's see your current remote repositories:

---

_****_

```bash
git remote -v
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>git remote -v
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>
```

---

_****_

That's unexpected - the command didn't return any output, which suggests there are no remotes configured despite the status mentioning an "origin". Let's try again with a different command:

---

_****_

```bash
git remote
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>git remote
moulinette
origin

C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>
```

---

_****_

Now I see you have two remotes: "moulinette" and "origin". Let's check their URLs:

---

_****_

```bash
git remote get-url origin && git remote get-url moulinette
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>git remote get
https://github.com/ArthurLepla/PlanDeMesurageToMendix.git
https://github.com/votre-nom-utilisateur/MoulinetteGenerique.git

C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>
```

---

_****_

I see you already have a "moulinette" remote pointing to what appears to be a placeholder URL: `https://github.com/votre-nom-utilisateur/MoulinetteGenerique.git`. We need to update this to point to your actual GitHub username instead of "votre-nom-utilisateur" (which means "your-username" in French).

Let's update the remote URL:

---

_****_

```bash
git remote -v
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>git remote -v
moulinette      https://github.com/votre-nom-utilisateur/MoulinetteGenerique.git (fetch)
moulinette      https://github.com/votre-nom-utilisateur/MoulinetteGenerique.git (push)    
origin  https://github.com/ArthurLepla/PlanDeMesurageToMendix.git (fetch)
origin  https://github.com/ArthurLepla/PlanDeMesurageToMendix.git (push)
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>
```

---

_****_

Now I can see the full details. You need to update the "moulinette" remote URL to point to your actual GitHub username. To do this, I'll need your GitHub username. Could you please provide it, or would you like to update the remote URL with a command yourself?

For example, if your new GitHub username is "YourGitHubUsername", the command would be:

```
git remote set-url moulinette https://github.com/YourGitHubUsername/MoulinetteGenerique.git
```

Please let me know your GitHub username, and I'll help you update the remote URL and push your code to the new repository.

---

_**User**_

@https://github.com/ArthurLepla-Dv/MoulinetteGenerique.git 
Voici le lien de mo nouveau repo.


---

_**Assistant**_

<think>Great, you've provided the URL to your new GitHub repository. Let's update the remote URL and push your code to that repository.

The URL you provided is:
https://github.com/ArthurLepla-Dv/MoulinetteGenerique.git

So we need to update the "moulinette" remote to point to this URL instead of the placeholder one.</think>Thanks for providing the repository URL. I'll update the "moulinette" remote to point to your new GitHub repository and then push your code.

---

_****_

```bash
git remote set-url moulinette https://github.com/ArthurLepla-Dv/MoulinetteGenerique.git
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>git remote set
-url moulinette https://github.com/ArthurLepla-Dv/MoulinetteGenerique.git

C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>
```

---

_****_

Now let's verify that the remote URL has been updated correctly:

---

_****_

```bash
git remote -v
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>git remote -v
moulinette      https://github.com/ArthurLepla-Dv/MoulinetteGenerique.git (fetch)
moulinette      https://github.com/ArthurLepla-Dv/MoulinetteGenerique.git (push) 
origin  https://github.com/ArthurLepla/PlanDeMesurageToMendix.git (fetch)

C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>
```

---

_****_

The remote URL has been successfully updated. Now, let's push your code to the new repository. Since you're currently on the `feature/mendix-generator` branch, you have a few options:

1. Push the current branch to the new repository
2. Create and push a new branch (like "main" or "master") to the new repository

Let's start by committing any changes you have, then push your current branch:

---

_****_

```bash
git add .
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>git add .
warning: in the working copy of 'src/app/mendix-generator/page.tsx', LF will be replaced by
CRLF the next time Git touches it
warning: in the working copy of '.specstory/history/.what-is-this.md', LF will be replaced 
md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '.specstory/history/debugging-api-route-404-error-in-next-j
s.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '.specstory/history/erreur-d'importation-d'assets-dans-iih.
md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '.specstory/history/pousser-vers-le-dépôt-github-moulinette
generique.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '.specstory/history/récupération-des-connectionnames-via-ad
apterid.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '.specstory/history/vérification-des-assets-dans-l'iih.md',
 LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'iih-essentials.public-2.0.0.openapi.json', LF will be repl
aced by CRLF the next time Git touches it
warning: in the working copy of 'src/app/api/assets/[id]/route.ts', LF will be replaced by 
CRLF the next time Git touches it
warning: in the working copy of 'src/app/api/variables/[id]/[assetId]/route.ts', LF will be
 replaced by CRLF the next time Git touches it

C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>
```

---

_****_

Now let's commit the changes:

---

_****_

```bash
git commit -m "Prepare code for migration to new repository"
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>git commit -m 
"Prepare code for migration to new repository"
[feature/mendix-generator 4c05ce0] Prepare code for migration to new repository
 34 files changed, 71999 insertions(+), 6415 deletions(-)
 create mode 100644 .specstory/history/.what-is-this.md
 create mode 100644 .specstory/history/aide-pour-git-push-sur-nouvelle-branche.md
 create mode 100644 .specstory/history/analyse-du-repository-de-l'application.md
 create mode 100644 .specstory/history/animation-gsap-pour-la-page-configure-ied.md        
 create mode 100644 .specstory/history/configuration-des-attributs-ipe-dans-l'iih.md       
 create mode 100644 .specstory/history/correction-d'adresse-api.md
 create mode 100644 .specstory/history/debugging-404-error-in-next-js-api-route.md
 create mode 100644 .specstory/history/debugging-api-route-404-error-in-next-js.md
 create mode 100644 .specstory/history/erreur-d'importation-d'assets-dans-iih.md
 create mode 100644 ".specstory/history/pousser-vers-le-d\303\251p\303\264t-github-moulinet
tegenerique.md"
 create mode 100644 ".specstory/history/r\303\251cup\303\251ration-des-connectionnames-via-
adapterid.md"
 create mode 100644 ".specstory/history/v\303\251rification-des-assets-dans-l'iih.md"      
 create mode 100644 docs/SANKEY_DOCUMENTATION.md
 rename iih-essentials.public-1.8.0.openapi.json => iih-essentials.public-2.0.0.openapi.jso
n (52%)
 create mode 100644 src/app/api/adapters/[id]/browse/route.ts
 create mode 100644 src/app/api/adapters/[id]/connections/route.ts
 create mode 100644 src/app/api/adapters/[id]/route.ts
 create mode 100644 src/app/api/adapters/route.ts
 rename src/app/api/assets/{[assetId] => [id]}/route.ts (62%)
 rename src/app/api/assets/{[assetId] => [id]}/variables/route.ts (74%)
 rename src/app/api/variables/{ => [id]}/[assetId]/route.ts (100%)
 create mode 100644 src/app/sandbox/page.tsx

C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>
```

---

_****_

Now that we've committed the changes, let's first check what branches you have locally:

---

_****_

```bash
git branch
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>git branch
* feature/mendix-generator
* feature/mendix-generator
  main
* feature/mendix-generator
* feature/mendix-generator
  main
~
~
~
* feature/mendix-generator
  main
~
~
~
~
~
~
~
(END)...skipping...
* feature/mendix-generator
  main
~
~
~
~
~
~
~
~
~
~
~
~
~
~
(END)
```

---

_****_

I see that you have two branches: `feature/mendix-generator` (which you're currently on) and `main`. Let's push your current branch to the new repository first:

---

_****_

```bash
cd C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix && git push moulinette feature/mendix-generator
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>cd 
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix && 
git push moulinette feature/mendix-generator
Microsoft Windows [version 10.0.19045.5487]
(c) Microsoft Corporation. Tous droits réservés.

C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>c
d C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix
 && git push moulinette feature/mendix-generator
```

---

_****_

It seems like the command completed but didn't show any output. Let's try pushing again, this time adding the `-v` flag for more verbose output and prompting for your GitHub credentials:

---

_****_

```bash
git push -v moulinette feature/mendix-generator
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>git push -v mo
ulinette feature/mendix-generator
Pushing to https://github.com/ArthurLepla-Dv/MoulinetteGenerique.git
remote: Repository not found.
fatal: repository 'https://github.com/ArthurLepla-Dv/MoulinetteGenerique.git/' not found
```

---

_****_

I see the issue. The repository URL might be incorrect or you might not have the proper access permissions. Let's verify the repository URL and try a different approach. Let's try to clone your repository first to verify it exists and is accessible:

---

_****_

```bash
cd .. && git clone https://github.com/ArthurLepla-Dv/MoulinetteGenerique.git test-clone && cd test-clone && dir
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>cd .. && git c
lone https://github.com/ArthurLepla-
```

---

_****_

It seems the command was interrupted. Let's verify the repository URL again. You mentioned the URL is:
`https://github.com/ArthurLepla-Dv/MoulinetteGenerique.git`

Let's try a different approach. Since this is a new repository on a new GitHub account, we need to set it up properly. Here's what we'll do:

1. First, let's check if the repository is accessible with a simple curl command
2. Then, we'll add the correct remote URL and push your code

---

_****_

```bash
cd C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix && curl -s https://github.com/ArthurLepla-Dv/MoulinetteGenerique
```

```
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
=">

      <img alt="" class="position-absolute" height="49" width="166" style="  top: 297px; le
ft: 371px; z-index: 7;"
      src="data:image/png;base64,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
B8WMAAAAASUVORK5CYII=">

      <img alt="" class="position-absolute" height="75" width="430" style="top: 263px; left
: 442px; z-index: 6;"
      src="data:image/png;base64,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">

      <img alt="" class="position-absolute" height="123" width="304" style="top: 73px; left
: 467px; z-index: 5;"
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATAAAAB7CAMAAADEzSzaAAAAA3NCSVQICA
jb4U/gAAABgFBMVEX////jyZz02KW2pHvdxZu2pYLny5fv1qWFel7Vu4OlmnasnHuyn3uKfmLexZbVvpSEe2Lkx5Ts2
7LSuIXGs4vFsIrZxJbs0aLPvJO6p4Pp2rHlzZ3WvY3Puo7dy6DayaHOtoTdwZJuaFvJsn6llXPw1KC2o3fWxZ3ErYSo
mnuekm/HsoSekm+AdmKomnucjm3OtYvn17GcjnOllXO6p4PKsIjSuIt7c2O8rIWEfGmSh3ONg2V1cGGUinTt0Jydk3F
zbGHPuo7kz6GJf2vn1q3q1aTfz6majnm2pHuyn3u2pYKyn3vPuo7s0aLOtYvSwJm8rIW3lXKllXq9q4ndxZvVvpTexZ
bPuo7SuIXErYR7c2N1cGGEe2Komnu2pYLPvJPGs4vWvY3OuJF8dWmNgmxybFuOhHG6p4OsnHvOuJGsnHuEe2LFrn3Gs
4vHsoTFsIq6p4O2pYLKsIi2pYLZxJa2pYLayaHZxJbGs4usnHvbv4+vnHalkG6Jf2t/eWx8dWl0XqRGAAAAgHRSTlMA
////////////////////////////////////////////Ebv//3f//////0Qid////yJE7v//Iu4iRP8iRP//Ecz/M//
//yJ3d4iqu8zd////d4iqu+7u7u4RESJEmarM3f8iMzNEVXeImZmqu7u7u7vMzN3d7u7u7v///xEREdqVUEYAAAAJcE
hZcwAACxIAAAsSAdLdfvwAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzQGstOgAAAUrUlEQVR4nO1dC
0MTVxbeMDNOrGQmEUgIECCKiooFQeUhKj62iI+uimhti692pbi2dq2P2tb2r+99nce9MwNJVIJdDiTzzGTuN9/5znfv
jPiPf2z7+Pe+dp/BpxX/Pv2fdp/CpxU7gDUZO4A1GTuANRk7gDUZT07/cnvo9cr6artP5BOJtdeX9vZdGhw6NPhyB7L
N4931vX17+/okYkODhx7sOLJN4i+Jl4pLg4NDg0PnF9p9Rts7Fgy/+jRiIi8ftPuUtnesH9+rEZOTQYnY0Fq7z2k7x+
LxvX0Csr3HJWp7Lw0NHRoafL0jY9mxLsXreB+8SYINDu2Uyux4LRX/eN/x4zovv5BJObijYpmx8IWKQxD/UvGm3ae1b
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">

      <img alt="" class="position-absolute" height="50" width="116" style="top: 113px; left
: 762px; z-index: 4;"
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAAyCAMAAAC6RQ9kAAAAA3NCSVQICA
jb4U/gAAABgFBMVEX////kyZm1pIDexpr73qqnmnallnGnmnn33aqjlXn12anszpi7p4PUvZPu1aXPuo6tm3zr0aLfx
ZbNt4xxbWOUim6yn3l7c2NsaF2+rIStm3yom4C2o3v22KSznW+rnIGejGuqlm3ZxJZxbWN0bFvUvZPv0JvnzZ2MfmPA
rYq7p4PXvo7Qu5LFsoq+rIRsaWDx057ErYKznXCsmnKFe2qom4CPgWSMhG3Qu5Kck3OllnGjlXl7c2NzcGeJf217c2O
Jf23FsoqUim6+rISck3PArYp/eWl/eGWfknrGsIzArYrGsIyck3PNt4zXvo67p4Pr0aLQu5K7p4Omk2zfxZbZxJbErY
L12anu1aWwm2753KfmzaHny5aMg3N/eWmfknqajnmUiXSMhG2Mg3OrnIGjlXmUim6UiXSMhG2EeGN/eGW1pICajHOFe
2rGsIy7p4OVhme+rIStm3ynmnmejGuUim6VhmfUvZPQu5LNt4zexprPuo7GsIy7p4Oyn3mmk2w+/MV0AAAAgHRSTlMA
////////////////////RP///yJ3/yIR7v9E////RHe7/xEiu///RHfu/////xH/////IjNEVaqqzMwRESIzVXeIu8z
dIiIzZmZ3d4iZqru7u7vM3d3u7u7///8RESIiIiIiMzMzMzMzM0RERFVVVWZmZmZmZnd3d4iIiIiIiOmar1cAAAAJcE
hZcwAACxIAAAsSAdLdfvwAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzQGstOgAAAFzUlEQVRYheWXh
3saRxDFvSzHHQsczUEKCFVkiINKFEW25RZFcVwjJFvNTu+99+p/PfNmCwfcxYosf8n3ZcB3gjvv797sm9nl1KlHxNyj
bngCMf7U/wU6929Al/5L6X3nq43f5ud/uf3ZpScARXp/GB/68q1fD4IHYXP5TC73em731psnDYXS9dMDX729nVZBmkI
pVc4hXr188tCLA9CfAiIqftM/1WwTda90otC5IeilbahkoYAG9Ocyiz1J6JDSNw41Kg0wvRTOTVC3HgvzwcbG7ZJrfo
NKLx8qTms6IBxT+cPyY1JvHqgmxrhlPpPSq54rm21WyFyXZDzGGVC/OSby8jYP1KRBdq9Y6Dnvgrn8cwACZRc+4rklU
8FXIZv4xvGg20qLeEDUPS576kjnfAN9D5cUpxZYfeJsa6m7x2J+CSIkBCFV/ZaFWqVbSrtI6dwq7SjODc9q7liFc2Dm
yzw6EtxP71IjDKkdNFUzRDT5tkDBUUobOLd3VND46urqjQZi6mYYlsvl18oIQbE3T1ERUkiEwEngjIOsdrvdgrQx+yz
Ht6c5xuil3wlbgBJGEGY0Gk84hP4k+idh+PxnPnWkGIuH2tG0AIvQWAsXRqFRiy+OxkyE2oGlyd+wPP1IfeE6wSeh9B
/nmKB5sZjJZjNeDGuh6lPUk6BTFiVdIqWFWqR0avsZZ2g1m6FXDLRYoQuZzEQSVESsaU/mi7JyEepTwE0+VRBaaYFGz
mYnYqCyhku11PUE9zrvGJ3WREKG6HFK2TVFVyadU1QrZwGVkENDx0AXAa0nKG1EjCP7J6GhKtrfbc8LSKnQ0BryW4+D
Vmm2s36yewct5GZXitB2HTR2dEDu8RGoWMTQMU4qigIm1fu7khGuTI179JGgQdgut8t4604VmPQyVEp2UiYOWskiUq8
kuFdGKlVEfCpIaaAqvud7nufjQEdu9TCSTm8BRopxUlGIOl3K1BJLpl9+ItJ96HOZUlohlIei8/lsoNLMqcwgRieVoH
lUUz1Jqe0xwprWaQ9p/maZCJUsNTBGkk9zekUd/vVjoLKKx/ET5nTAvJFlRDA0XdEwpBYH3hxFoIsYetRJRYnM05Vk9
0a7jssul0w6PWs1cnY9Lhq4l6GCe1J21EmktMKN49MEaH9FkW4N0U8CaMVmVx8HoHQXehLa3YhS1DDFF/Fz6tqsNGDh
HMVQdq5v0F6gTMmY9FbYSSM9qYglAdAXE+bUrcvWSq4Xc3p1Xi03MEp5TnFXHe1hxL7kXrmAJLyUlN74zoD0kqxZrdT
TZcolo1Jdo1Swk2JWNygt4HFeToQKl1jhVlL8UQ44vWwi0yK4H0bcK6qZOCeRUvQkkjr8M9Ok15VLZLXWSTbu1Rq1XO
x3AzunuJF70oiTihisjiXoagK0vzFxD6C1a/faKuUU87LjoLg51kmYU3EWUmOdVLIrdv9g9i5Up0rXqe/Anu1ITinpy
Y42wiJG7QEa66TSYOeLFKwQ5XSkI+l5xZIe9N1Lt+f1GjYYVYxyHnMa66RGZF9m59WuqrTKaCMZmb5Lr1OKHouxR5XS
Zh3GjnXSFEtsi3a7uLCwsNi1WnkRV1hlTHK1YGxbVBTKq/WIk4qcrIvwWJyTplgdpqrKeYn2f1ZqSlRn1+efiYBeM0Y
Set835KQip60HaJyTuGQkVkkNjW7RsHOoGBsZrdit8Mbsmq5TGe+kIruil9STSvwf006pbUnOSEaibQ7YKFml2m55bB
6GnFTkx95BocY5SdcpulvV2s71ClunFurbOe0KuW96r+mx2WEoHmcWNZOdmZ5e61xvRaFLq+/Sr8TzFH/82bt7t/cMx
+87O/Qzcffw8HBPNyTdgP2+e/eNUikK3O5qE4iaifxziOrziJWVyZVJxPrMw+mvO5+0YjtjUlz56MOPX6B4//NSo/Hd
nTvf9zY3N3u9/fX19Xv37k9i6JXJ+zMcF6Y5fux01tY6a51WqzXWcrS/AGShj5noGrZMAAAAAElFTkSuQmCC">     
    </div>
  </div>

<div class="container-lg mt-5 px-3">
  <!-- '"` --><!-- </textarea></xmp> --></option></form><form role="search" data-turbo="fal
se" action="/search" accept-charset="UTF-8" method="get">
    <label for="not-found-search" class="d-block text-normal color-fg-muted mb-1 f4">Find c
ode, projects, and people on GitHub:</label>
    <div class="d-flex flex-items-center">
      <input type="text" name="q" id="not-found-search" class="flex-auto input-lg form-cont
rol mr-2">
        <button type="submit" data-view-component="true" class="btn">    Search
</button>
    </div>
</form>
    <div class="mt-5 color-fg-muted text-center">
      <a href="https://support.github.com?tags=dotcom-404" class="Link--secondary">Contact 
Support</a> &mdash;
      <a href="https://githubstatus.com" class="Link--secondary">GitHub Status</a> &mdash; 
      <a href="https://twitter.com/githubstatus" class="Link--secondary">@githubstatus</a> 
    </div>
</div>

  </main>

  </div>

            <footer role="contentinfo" class="footer pt-6 position-relative" data-analytics
-visible="{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;visible&quot;,&
quot;label&quot;:&quot;text: Marketing footer&quot;}" >
  <h2 class="sr-only">Site-wide Links</h2>
  <div class="container-xl p-responsive">
    <div class="d-flex flex-wrap py-5 mb-5">
      <section class="col-12 col-lg-4 mb-5">
        <a href="/" data-analytics-event="{&quot;category&quot;:&quot;Footer&quot;,&quot;ac
tion&quot;:&quot;go to home&quot;,&quot;label&quot;:&quot;text:home&quot;}" class="color-fg
-default d-inline-block" aria-label="Go to GitHub homepage">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 367.4 90" class="footer-logo
-mktg d-block" height="30"><g fill="currentColor"><path d="m46.1 0c-25.5 0-46.1 20.6-46.1 4
6.1 0 20.4 13.2 37.7 31.5 43.8 2.3.4 3.2-1 3.2-2.2 0-1.1-.1-4.7-.1-8.6-11.6 2.1-14.6-2.8-15
.5-5.4-.5-1.3-2.8-5.4-4.7-6.5-1.6-.9-3.9-3-.1-3.1 3.6-.1 6.2 3.3 7.1 4.7 4.2 7 10.8 5 13.4 
3.8.4-3 1.6-5 2.9-6.2-10.3-1.2-21-5.1-21-22.8 0-5 1.8-9.2 4.7-12.4-.5-1.2-2.1-5.9.5-12.2 0 
0 3.9-1.2 12.7 4.7 3.7-1 7.6-1.6 11.5-1.6s7.8.5 11.5 1.6c8.8-6 12.7-4.7 12.7-4.7 2.5 6.3.9 
11.1.5 12.2 2.9 3.2 4.7 7.3 4.7 12.4 0 17.7-10.8 21.6-21.1 22.8 1.7 1.4 3.1 4.2 3.1 8.5 0 6
.2-.1 11.1-.1 12.7 0 1.2.9 2.7 3.2 2.2 18.2-6.1 31.4-23.4 31.4-43.8.3-25.4-20.4-46-45.9-46z
"></path><path d="m221.6 67.1h-.1zm0 0c-.5 0-1.8.3-3.2.3-4.4 0-5.9-2-5.9-4.6v-17.5h8.9c.5 0
 .9-.4.9-1.1v-9.5c0-.5-.4-.9-.9-.9h-8.9v-11.7c0-.4-.3-.7-.8-.7h-12c-.5 0-.8.3-.8.7v12.1s-6.
1 1.5-6.5 1.6-.7.5-.7.9v7.6c0 .6.4 1.1.9 1.1h6.2v18.3c0 13.6 9.5 15 16 15 3 0 6.5-.9 7.1-1.
2.3-.1.5-.5.5-.9v-8.4c.1-.6-.3-1-.8-1.1zm132.2-12.2c0-10.1-4.1-11.4-8.4-11-3.3.2-6 1.9-6 1.
9v19.6s2.7 1.9 6.8 2c5.8.2 7.6-1.9 7.6-12.5zm13.6-.9c0 19.1-6.2 24.6-17 24.6-9.1 0-14.1-4.6
-14.1-4.6s-.2 2.6-.5 2.9c-.2.3-.4.4-.8.4h-8.3c-.6 0-1.1-.4-1.1-.9l.1-62c0-.5.4-.9.9-.9h11.9
c.5 0 .9.4.9.9l-.1 20.9s4.6-3 11.3-3h.1c6.8-0 16.7 2.5 16.7 21.7zm-48.7-20.2h-11.7c-.6 0-.9
.4-.9 1.1v30.3s-3.1 2.2-7.3 2.2-5.4-1.9-5.4-6.1v-26.5c0-.5-.4-.9-.9-.9h-11.9c-.5 0-.9.4-.9.
9v28.5c0 12.3 6.9 15.3 16.3 15.3 7.8 0 14.1-4.3 14.1-4.3s.3 2.2.4 2.5.5.5.9.5h7.5c.6 0 .9-.
4.9-.9l.1-41.7c-.1-.4-.6-.9-1.2-.9zm-132.2 0h-11.9c-.5 0-.9.5-.9 1.1v40.9c0 1.1.7 1.5 1.7 1
.5h10.7c1.1 0 1.4-.5 1.4-1.5v-41.1c0-.5-.5-.9-1-.9zm-5.8-18.9c-4.3 0-7.7 3.4-7.7 7.7s3.4 7.
7 7.7 7.7c4.2 0 7.6-3.4 7.6-7.7s-3.4-7.7-7.6-7.7zm92-1.4h-11.8c-.5 0-.9.4-.9.9v22.8h-18.5v-
22.7c0-.5-.4-.9-.9-.9h-11.9c-.5 0-.9.4-.9.9v62c0 .5.5.9.9.9h11.9c.5 0 .9-.4.9-.9v-26.6h18.5
l-.1 26.5c0 .5.4.9.9.9h11.9c.5 0 .9-.4.9-.9v-62c0-.4-.4-.9-.9-.9zm-105.3 27.5v32c0 .2-.1.6-
.3.7 0 0-7 5-18.5 5-13.9 0-30.3-4.4-30.3-33 0-28.7 14.4-34.6 28.4-34.5 12.2 0 17.1 2.7 17.8
 3.2.2.3.3.5.3.8l-2.3 9.9c0 .5-.5 1.1-1.1.9-2-.6-5-1.8-12.1-1.8-8.2 0-17 2.3-17 20.8s8.4 20
.6 14.4 20.6c5.1 0 7-.6 7-.6v-12.8h-8.2c-.6 0-1.1-.4-1.1-.9v-10.3c0-.5.4-.9 1.1-.9h20.9c.6-
.1 1 .4 1 .9z"></path></g></svg>

        </a>

        <h3 class="h5 mt-4 mb-0" id="subscribe-to-newsletter">Subscribe to our developer ne
wsletter</h3>
        <p class="f5 color-fg-muted mb-3">Get tips, technical guides, and best practices. T
wice a month. Right in your inbox.</p>
        <a class="btn-mktg mb-4 btn-muted-mktg" data-analytics-event="{&quot;category&quot;
:&quot;Subscribe&quot;,&quot;action&quot;:&quot;click to Subscribe&quot;,&quot;label&quot;:
&quot;ref_cta:Subscribe;&quot;}" href="https://resources.github.com/newsletter/">
  Subscribe


</a>

      </section>

      <nav class="col-6 col-sm-3 col-lg-2 mb-6 mb-md-2 pr-3 pr-lg-0 pl-lg-4" aria-labelledb
y="footer-title-product">
        <h3 class="h5 mb-3 text-mono color-fg-muted text-normal" id="footer-title-product">
          Product
        </h3>

        <ul class="list-style-none color-fg-muted f5">
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;features&quot;,&quot;context&quot;:&quot;product&quot;,
&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;features_link_product_footer&quot;
}" href="/features">Features</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;enterprise&quot;,&quot;context&quot;:&quot;product&quot
;,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;enterprise_link_product_footer&q
uot;}" href="/enterprise">Enterprise</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;copilot&quot;,&quot;context&quot;:&quot;product&quot;,&
quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;copilot_link_product_footer&quot;}"
 href="/features/copilot">Copilot</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;security&quot;,&quot;context&quot;:&quot;product&quot;,
&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;security_link_product_footer&quot;
}" href="/security">Security</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;pricing&quot;,&quot;context&quot;:&quot;product&quot;,&
quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;pricing_link_product_footer&quot;}"
 href="/pricing">Pricing</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;team&quot;,&quot;context&quot;:&quot;product&quot;,&quo
t;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;team_link_product_footer&quot;}" href=
"/team">Team</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;resources&quot;,&quot;context&quot;:&quot;product&quot;
,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;resources_link_product_footer&quo
t;}" href="https://resources.github.com">Resources</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;roadmap&quot;,&quot;context&quot;:&quot;product&quot;,&
quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;roadmap_link_product_footer&quot;}"
 href="https://github.com/github/roadmap">Roadmap</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;compare&quot;,&quot;context&quot;:&quot;product&quot;,&
quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;compare_link_product_footer&quot;}"
 href="https://resources.github.com/devops/tools/compare">Compare GitHub</a>
          </li>
        </ul>
      </nav>

      <nav class="col-6 col-sm-3 col-lg-2 mb-6 mb-md-2 pr-3 pr-md-0 pl-md-4" aria-labelledb
y="footer-title-platform">
        <h3 class="h5 mb-3 text-mono color-fg-muted text-normal" id="footer-title-platform"
>
          Platform
        </h3>

        <ul class="list-style-none f5">
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;dev-api&quot;,&quot;context&quot;:&quot;platform&quot;,
&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;dev-api_link_platform_footer&quot;
}" href="https://docs.github.com/get-started/exploring-integrations/about-building-integrat
ions">Developer API</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;partners&quot;,&quot;context&quot;:&quot;platform&quot;
,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;partners_link_platform_footer&quo
t;}" href="https://partner.github.com">Partners</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;edu&quot;,&quot;context&quot;:&quot;platform&quot;,&quo
t;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;edu_link_platform_footer&quot;}" href=
"https://github.com/edu">Education</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;cli&quot;,&quot;context&quot;:&quot;platform&quot;,&quo
t;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;cli_link_platform_footer&quot;}" href=
"https://cli.github.com">GitHub CLI</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;desktop&quot;,&quot;context&quot;:&quot;platform&quot;,
&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;desktop_link_platform_footer&quot;
}" href="https://desktop.github.com">GitHub Desktop</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;mobile&quot;,&quot;context&quot;:&quot;platform&quot;,&
quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;mobile_link_platform_footer&quot;}"
 href="https://github.com/mobile">GitHub Mobile</a>
          </li>
        </ul>
      </nav>

      <nav class="col-6 col-sm-3 col-lg-2 mb-6 mb-md-2 pr-3 pr-md-0 pl-md-4" aria-labelledb
y="footer-title-support">
        <h3 class="h5 mb-3 text-mono color-fg-muted text-normal" id="footer-title-support">
          Support
        </h3>

        <ul class="list-style-none f5">
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;docs&quot;,&quot;context&quot;:&quot;support&quot;,&quo
t;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;docs_link_support_footer&quot;}" href=
"https://docs.github.com">Docs</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;community&quot;,&quot;context&quot;:&quot;support&quot;
,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;community_link_support_footer&quo
t;}" href="https://github.community">Community Forum</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;services&quot;,&quot;context&quot;:&quot;support&quot;,
&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;services_link_support_footer&quot;
}" href="https://services.github.com">Professional Services</a>

          </li>
            <li class="lh-condensed mb-3">
              <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;
footer&quot;,&quot;action&quot;:&quot;premium_support&quot;,&quot;context&quot;:&quot;suppo
rt&quot;,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;premium_support_link_supp
ort_footer&quot;}" href="/enterprise/premium-support">Premium Support</a>
            </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;skills&quot;,&quot;context&quot;:&quot;support&quot;,&q
uot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;skills_link_support_footer&quot;}" h
ref="https://skills.github.com">Skills</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;status&quot;,&quot;context&quot;:&quot;support&quot;,&q
uot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;status_link_support_footer&quot;}" h
ref="https://www.githubstatus.com">Status</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;contact_github&quot;,&quot;context&quot;:&quot;support&
quot;,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;contact_github_link_support_
footer&quot;}" href="https://support.github.com?tags=dotcom-footer">Contact GitHub</a>     
          </li>
        </ul>
      </nav>

      <nav class="col-6 col-sm-3 col-lg-2 mb-6 mb-md-2 pr-3 pr-md-0 pl-md-4" aria-labelledb
y="footer-title-company">
        <h3 class="h5 mb-3 text-mono color-fg-muted text-normal" id="footer-title-company">
          Company
        </h3>

        <ul class="list-style-none f5">
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;about&quot;,&quot;context&quot;:&quot;company&quot;,&qu
ot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;about_link_company_footer&quot;}" hre
f="https://github.com/about">About</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;customer_stories&quot;,&quot;context&quot;:&quot;compan
y&quot;,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;customer_stories_link_comp
any_footer&quot;}" href="/customer-stories?type=enterprise">Customer stories</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;blog&quot;,&quot;context&quot;:&quot;company&quot;,&quo
t;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;blog_link_company_footer&quot;}" href=
"https://github.blog">Blog</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;readme&quot;,&quot;context&quot;:&quot;company&quot;,&q
uot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;readme_link_company_footer&quot;}" h
ref="/readme">The ReadME Project</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;careers&quot;,&quot;context&quot;:&quot;company&quot;,&
quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;careers_link_company_footer&quot;}"
 href="https://github.careers">Careers</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;newsroom&quot;,&quot;context&quot;:&quot;company&quot;,
&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;newsroom_link_company_footer&quot;
}" href="/newsroom">Newsroom</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;inclusion&quot;,&quot;context&quot;:&quot;company&quot;
,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;inclusion_link_company_footer&quo
t;}" href="/about/diversity">Inclusion</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;social_impact&quot;,&quot;context&quot;:&quot;company&q
uot;,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;social_impact_link_company_fo
oter&quot;}" href="https://socialimpact.github.com">Social Impact</a>
          </li>
          <li class="lh-condensed mb-3">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;shop&quot;,&quot;context&quot;:&quot;company&quot;,&quo
t;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;shop_link_company_footer&quot;}" href=
"https://shop.github.com">Shop</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <div class="color-bg-subtle">
    <div class="container-xl p-responsive f6 py-4 d-md-flex flex-justify-between flex-items
-center">
      <nav aria-label="Legal and Resource Links">
        <ul class="list-style-none d-flex flex-wrap color-fg-muted">
          <li class="mx-2">
            &copy; <time datetime="2025">2025</time> GitHub, Inc.
          </li>

          <li class="mx-2">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;terms&quot;,&quot;context&quot;:&quot;subfooter&quot;,&
quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;terms_link_subfooter_footer&quot;}"
 href="https://docs.github.com/site-policy/github-terms/github-terms-of-service">Terms</a> 
          </li>

          <li class="mx-2">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;privacy&quot;,&quot;context&quot;:&quot;subfooter&quot;
,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;privacy_link_subfooter_footer&quo
t;}" href="https://docs.github.com/site-policy/privacy-policies/github-privacy-statement">P
rivacy</a>
            (<a href="https://github.com/github/site-policy/pull/582" class="Link--secondar
y">Updated <time datetime="2022-08">02/2024</time></a>)
          </li>

          <li class="mx-2">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;sitemap&quot;,&quot;context&quot;:&quot;subfooter&quot;
,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;sitemap_link_subfooter_footer&quo
t;}" href="/sitemap">Sitemap</a>
          </li>

          <li class="mx-2">
            <a class="Link--secondary" data-analytics-event="{&quot;location&quot;:&quot;fo
oter&quot;,&quot;action&quot;:&quot;what_is_git&quot;,&quot;context&quot;:&quot;subfooter&q
uot;,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;what_is_git_link_subfooter_fo
oter&quot;}" href="/git-guides">What is Git?</a>
          </li>

            <li class="mx-2" >
  <cookie-consent-link>
    <button
      type="button"
      class="Link--secondary underline-on-hover border-0 p-0 color-bg-transparent"
      data-action="click:cookie-consent-link#showConsentManagement"
      data-analytics-event="{&quot;location&quot;:&quot;footer&quot;,&quot;action&quot;:&qu
ot;cookies&quot;,&quot;context&quot;:&quot;subfooter&quot;,&quot;tag&quot;:&quot;link&quot;
,&quot;label&quot;:&quot;cookies_link_subfooter_footer&quot;}"
    >
      Manage cookies
    </button>
  </cookie-consent-link>
</li>

<li class="mx-2">
  <cookie-consent-link>
    <button
      type="button"
      class="Link--secondary underline-on-hover border-0 p-0 color-bg-transparent"
      data-action="click:cookie-consent-link#showConsentManagement"
      data-analytics-event="{&quot;location&quot;:&quot;footer&quot;,&quot;action&quot;:&qu
ot;dont_share_info&quot;,&quot;context&quot;:&quot;subfooter&quot;,&quot;tag&quot;:&quot;li
nk&quot;,&quot;label&quot;:&quot;dont_share_info_link_subfooter_footer&quot;}"
    >
      Do not share my personal information
    </button>
  </cookie-consent-link>
</li>

        </ul>
      </nav>

      <nav aria-label="GitHub&#39;s Social Media Links" class="mt-3 mt-md-0">

<ul class="list-style-none d-flex flex-items-center lh-condensed-ultra">
    <li class="ml-md-3">
      <a href="https://www.linkedin.com/company/github" class="footer-social-icon d-block L
ink--outlineOffset" data-analytics-event="{&quot;category&quot;:&quot;Footer&quot;,&quot;ac
tion&quot;:&quot;go to Linkedin&quot;,&quot;label&quot;:&quot;text:text:linkedin&quot;}">  
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 18" aria-hidden="true" clas
s="d-block" width="19" height="18"><path d="M3.94 2A2 2 0 1 1 2 0a2 2 0 0 1 1.94 2zM4 5.48H
0V18h4zm6.32 0H6.34V18h3.94v-6.57c0-3.66 4.77-4 4.77 0V18H19v-7.93c0-6.17-7.06-5.94-8.72-2.
91z" fill="currentColor"></path></svg>

        <span class="sr-only">GitHub on LinkedIn</span>
      </a>
    </li>
    <li class="ml-3">
      <a href="https://www.instagram.com/github" class="footer-social-icon d-block Link--ou
tlineOffset" data-analytics-event="{&quot;category&quot;:&quot;Footer&quot;,&quot;action&qu
ot;:&quot;go to Instagram&quot;,&quot;label&quot;:&quot;text:text:instagram&quot;}">       
        <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" aria-hidden=
"true" class="d-block" width="18" height="18"><title>Instagram</title><path d="M12 0C8.74 0
 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.
63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277
.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 
1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2
.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.6
36.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-
2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.4
99-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249
 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057
 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.47
9.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.
859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.
379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061
-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.
419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03z
m0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 
6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-
1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1
.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" fill="currentColor"></path></svg>

        <span class="sr-only">GitHub on Instagram</span>
      </a>
    </li>
    <li class="ml-3">
      <a href="https://www.youtube.com/github" class="footer-social-icon d-block Link--outl
ineOffset" data-analytics-event="{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot
;:&quot;go to YouTube&quot;,&quot;label&quot;:&quot;text:text:youtube&quot;}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.17 13.6" aria-hidden="true"
 class="d-block" width="23" height="16"><path d="M18.77 2.13A2.4 2.4 0 0 0 17.09.42C15.59 0
 9.58 0 9.58 0a57.55 57.55 0 0 0-7.5.4A2.49 2.49 0 0 0 .39 2.13 26.27 26.27 0 0 0 0 6.8a26.
15 26.15 0 0 0 .39 4.67 2.43 2.43 0 0 0 1.69 1.71c1.52.42 7.5.42 7.5.42a57.69 57.69 0 0 0 7
.51-.4 2.4 2.4 0 0 0 1.68-1.71 25.63 25.63 0 0 0 .4-4.67 24 24 0 0 0-.4-4.69zM7.67 9.71V3.8
9l5 2.91z" fill="currentColor"></path></svg>

        <span class="sr-only">GitHub on YouTube</span>
      </a>
    </li>
    <li class="ml-3">
      <a href="https://x.com/github" class="footer-social-icon d-block Link--outlineOffset"
 data-analytics-event="{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;go
 to X&quot;,&quot;label&quot;:&quot;text:text:x&quot;}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" fill="currentColor"
 aria-hidden="true" class="d-block" width="16" height="16"><path d="M714.163 519.284 1160.8
9 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 3
27.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162
.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"></path></s
vg>

        <span class="sr-only">GitHub on X</span>
      </a>
    </li>
    <li class="ml-3">
      <a href="https://www.tiktok.com/@github" class="footer-social-icon d-block Link--outl
ineOffset" data-analytics-event="{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot
;:&quot;go to tiktok&quot;,&quot;label&quot;:&quot;text:text:tiktok&quot;}">
        <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" aria-hidden=
"true" class="d-block" width="18" height="18"><title>TikTok</title><path d="M12.525.02c1.31
-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.0
5-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35
 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.7
1-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.0
4 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.6
1.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.5
7.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="currentColor"></path></svg>

        <span class="sr-only">GitHub on TikTok</span>
      </a>
    </li>
    <li class="ml-3">
      <a href="https://www.twitch.tv/github" class="footer-social-icon d-block Link--outlin
eOffset" data-analytics-event="{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:
&quot;go to Twitch&quot;,&quot;label&quot;:&quot;text:text:twitch&quot;}">
        <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" aria-hidden=
"true" class="d-block" width="18" height="18"><title>Twitch</title><path d="M11.571 4.714h1
.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.42
8L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" fill="current
Color"></path></svg>

        <span class="sr-only">GitHub on Twitch</span>
      </a>
    </li>
    <li class="ml-3">
      <a href="https://github.com/github" class="footer-social-icon d-block Link--outlineOf
fset" data-analytics-event="{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&qu
ot;go to github&#39;s org&quot;,&quot;label&quot;:&quot;text:text:github&quot;}">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 16 16" width="20" 
aria-hidden="true" class="d-block"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.
54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-
.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.3
3.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02
.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-
.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 
1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></p
ath></svg>

        <span class="sr-only">GitHub’s organization on GitHub</span>
      </a>
    </li>
</ul>

      </nav>
    </div>
  </div>
</footer>



    <ghcc-consent id="ghcc" class="position-fixed bottom-0 left-0" style="z-index: 999999" 
data-initial-cookie-consent-allowed="" data-cookie-consent-required="true"></ghcc-consent> 



  <div id="ajax-error-message" class="ajax-error-message flash flash-error" hidden>        
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-v
iew-component="true" class="octicon octicon-alert">
    <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.08
2 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 
0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 
1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
</svg>
    <button type="button" class="flash-close js-ajax-error-dismiss" aria-label="Dismiss err
or">
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data
-view-component="true" class="octicon octicon-x">
    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.7
49 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06
l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 
1 0-1.06Z"></path>
</svg>
    </button>
    You can’t perform that action at this time.
  </div>

    <template id="site-details-dialog">
  <details class="details-reset details-overlay details-overlay-dark lh-default color-fg-de
fault hx_rsm" open>
    <summary role="button" aria-label="Close dialog"></summary>
    <details-dialog class="Box Box--overlay d-flex flex-column anim-fade-in fast hx_rsm-dia
log hx_rsm-modal">
      <button class="Box-btn-octicon m-0 btn-octicon position-absolute right-0 top-0" type=
"button" aria-label="Close dialog" data-close-dialog>
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" da
ta-view-component="true" class="octicon octicon-x">
    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.7
49 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06
l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 
1 0-1.06Z"></path>
</svg>
      </button>
      <div class="octocat-spinner my-6 js-details-dialog-spinner"></div>
    </details-dialog>
  </details>
</template>

    <div class="Popover js-hovercard-content position-absolute" style="display: none; outli
ne: none;">
  <div class="Popover-message Popover-message--bottom-left Popover-message--large Box color
-shadow-large" style="width:360px;">
  </div>
</div>

    <template id="snippet-clipboard-copy-button">
  <div class="zeroclipboard-container position-absolute right-0 top-0">
    <clipboard-copy aria-label="Copy" class="ClipboardButton btn js-clipboard-copy m-2 p-0"
 data-copy-feedback="Copied!" data-tooltip-direction="w">
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data
-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon m-2">
    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7
.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1
 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C1
5.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a
.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-
.25Z"></path>
</svg>
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data
-view-component="true" class="octicon octicon-check js-clipboard-check-icon color-fg-succes
s d-none m-2">
    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.
751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></pat
h>
</svg>
    </clipboard-copy>
  </div>
</template>
<template id="snippet-clipboard-copy-button-unpositioned">
  <div class="zeroclipboard-container">
    <clipboard-copy aria-label="Copy" class="ClipboardButton btn btn-invisible js-clipboard
-copy m-2 p-0 d-flex flex-justify-center flex-items-center" data-copy-feedback="Copied!" da
ta-tooltip-direction="w">
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data
-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon">
    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7
.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1
 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C1
5.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a
.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-
.25Z"></path>
</svg>
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data
-view-component="true" class="octicon octicon-check js-clipboard-check-icon color-fg-succes
s d-none">
    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.
751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></pat
h>
</svg>
    </clipboard-copy>
  </div>
</template>




    </div>

    <div id="js-global-screen-reader-notice" class="sr-only mt-n1" aria-live="polite" aria-
atomic="true" ></div>
    <div id="js-global-screen-reader-notice-assertive" class="sr-only mt-n1" aria-live="ass
ertive" aria-atomic="true"></div>
  </body>
</html>


C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>
```

---

_****_

It looks like the repository URL is returning a 404 error page. This suggests the repository might not exist yet or there might be an issue with the URL. Let's create a proper URL for your new repository.

First, I see you've already created a remote called "moulinette" pointing to the new repository. Let's update its URL with your correct GitHub username and then push your code.

---

_****_

```bash
git remote set-url moulinette https://github.com/ArthurLepla-Dv/MoulinetteGenerique.git
```

---

_****_



---

_**User**_

je voudrais push tout cela sur le main

---

_**Assistant**_

<think>The user wants to push all their code to the 'main' branch on their new repository. Based on the previous commands, they already have a remote named "moulinette" set up to point to their new repository. Let's check if they have a main branch locally and then push to it.</think>Je vais vous aider à pousser tout votre code sur la branche `main` de votre nouveau dépôt GitHub. Vérifions d'abord les branches que vous avez localement puis nous ferons le push.

---

_****_

```bash
cd C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix && git branch
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>cd 
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix && 
git branch

C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>
```

---

_****_

C'est étrange que la commande n'affiche pas les branches. Essayons une commande légèrement différente pour voir toutes vos branches:

---

_****_

```bash
git branch -a
```

```
C:\Users\MAVAN\Desktop\ARLEP\PlanDeMesurageToMendixV2\PlanDeMesurageToMendix>git branch -a
* feature/mendix-generator
* feature/mendix-generator
* feature/mendix-generator
* feature/mendix-generator
  main
* feature/mendix-generator
  main
  remotes/origin/HEAD -> origin/main
  remotes/origin/feature/mendix-generator
  remotes/origin/main
~
~
* feature/mendix-generator
  main
  remotes/origin/HEAD -> origin/main
  remotes/origin/feature/mendix-generator
  remotes/origin/main
~
~
~
* feature/mendix-generator
  main
  remotes/origin/HEAD -> origin/main
  remotes/origin/feature/mendix-generator
  remotes/origin/main
~
~
~
~
~
~
~
(END)...skipping...
* feature/mendix-generator
  main
  remotes/origin/HEAD -> origin/main     
  remotes/origin/feature/mendix-generator
  remotes/origin/main
~
~
~
~
~
~
~
~
~
~
~
(END)
```

---

_****_

Je vois que vous avez deux branches locales: `feature/mendix-generator` (celle sur laquelle vous êtes actuellement) et `main`. Nous allons d'abord basculer sur la branche `main`, puis nous allons pousser cette branche vers votre nouveau dépôt GitHub.

---



---

