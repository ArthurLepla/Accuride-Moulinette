// BEGIN EXTRA CODE
// (Ajoutez ici des imports ou helpers si besoin)
// END EXTRA CODE

/**
 * Action JavaScript Mendix pour supprimer et recréer les objets IPE agrégés
 * Généré automatiquement
 * @returns {Promise<void>}
 */
export async function execute(params) {
  // BEGIN USER CODE

  // // Données pré-traitées à créer
const MENDIX_SUMMARY = {
  "undefined": [
    {
      "attributes": {
        "VariableName": "IPE_elec_USINE",
        "VariableId": "224127c0-462a-49b6-b953-db49376d4b6d",
        "Identifiant5Min": "c206e66b-e042-45ba-81d8-840c0424849d",
        "Identifiant1h": "e5a2d33f-1535-4c34-8dbe-dfc7b8da9008",
        "Identifiant4h": "069bcaa0-7d63-48f1-bc7d-62c4d5eb53e6",
        "Identifiant8h": "afce21cc-3d1b-46fd-af8f-31e05e63dde0",
        "Identifiant1day": "3bf07d93-0ded-4887-acdb-e1176ab71e0d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_USINE",
        "VariableId": "7ac425e4-53af-480a-bee8-a9779d324539",
        "Identifiant5Min": "b3250c13-52ae-481e-ad85-c9796d12f0fb",
        "Identifiant1h": "c59de3b9-c6ab-438f-8d4f-03e84e9b5933",
        "Identifiant4h": "320e1cb3-3aa3-4339-bdac-89c6e958c0cc",
        "Identifiant8h": "84b9a55d-c9f6-487e-af6c-3709007d567c",
        "Identifiant1day": "09f813b8-e3ae-451f-87f0-2b595e4e386b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_USINE",
        "VariableId": "1ac3ee87-4ae0-474e-a3f5-83811eed2d42",
        "Identifiant5Min": "b4b54a57-319c-474d-acfb-d67b9a743027",
        "Identifiant1h": "7fc27ca0-f8b9-447d-80d5-d0d988902ce9",
        "Identifiant4h": "14b41e46-3868-4032-b31c-5554ebd1330e",
        "Identifiant8h": "1089357b-9e65-4daa-9a94-3b0a35f9cf63",
        "Identifiant1day": "38390e91-9d2c-418b-9e98-568686aeb2c5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_USINE",
        "VariableId": "93999015-16e5-4607-a39f-5c41c8028284",
        "Identifiant5Min": "af00d589-bf84-4ab6-a0eb-d936c8bf619e",
        "Identifiant1h": "f311ef8b-5090-458f-ad56-431fbcd820b0",
        "Identifiant4h": "66a76678-faec-431e-8ec0-ce3d4ad2182f",
        "Identifiant8h": "e2fcda25-31c1-4225-ab0d-5620fa580851",
        "Identifiant1day": "ecf5414d-7144-4b18-b461-33db59c7a5d2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_USINE",
        "VariableId": "24c6eea9-d1c7-4591-9be0-ebc2d1a06748",
        "Identifiant5Min": "f5fd1e42-c466-4a39-98c5-b8b7e793dd3a",
        "Identifiant1h": "06f1b617-0395-4d0c-9e39-9930f94c3ac1",
        "Identifiant4h": "243be417-e3e8-453b-8e1c-6b34fd327122",
        "Identifiant8h": "58f2e2ab-6139-4fed-af84-21b8642bcdbe",
        "Identifiant1day": "5a291733-ce3b-4e2c-80b4-17e427e29c4a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_USINE",
        "VariableId": "26bb0a32-ae54-475c-9b47-b1684343f86b",
        "Identifiant5Min": "5d563a5a-9817-419e-9552-537ef675e362",
        "Identifiant1h": "359fe9fc-d4cb-4bfc-ba2a-0c6de6e76418",
        "Identifiant4h": "a3d93799-04cc-4f89-bf08-3a9df8142d7c",
        "Identifiant8h": "802be073-c83f-4c0d-b14d-70912d87e86d",
        "Identifiant1day": "f4e3e058-3e89-40e0-845a-4e2de1b3f010"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_USINE",
        "VariableId": "10a5b282-67f1-4cd4-964b-fd92e50d64a4",
        "Identifiant5Min": "d678b923-e478-4ec7-b308-4db81130e763",
        "Identifiant1h": "a9ff6568-89f8-40fb-a0e7-69ed9dce2f80",
        "Identifiant4h": "f284eff3-143f-4fc1-9560-8f39fb395419",
        "Identifiant8h": "0c959ed9-7a53-4778-9d90-51015110bb16",
        "Identifiant1day": "19f92617-cc9f-4b48-888c-4c78ee9ef6d8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_USINE",
        "VariableId": "68e8631f-7165-4273-b046-7bc2c3cdd872",
        "Identifiant5Min": "88e64227-0502-435a-9663-2677e8ab3c7b",
        "Identifiant1h": "1e2eaa4b-88dc-4d1d-8978-e21ccd89da44",
        "Identifiant4h": "1e81ca29-66b4-4814-a25c-50981c0a7edb",
        "Identifiant8h": "4d6ef692-1a2e-4e06-9deb-d6ecaf8a9ba2",
        "Identifiant1day": "3f535e93-c637-47d2-ace8-b6ff27498825"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_FACILITIES",
        "VariableId": "13ad1796-a290-45c1-bf1e-7f4d8d498cc6",
        "Identifiant5Min": "15459e26-c828-400b-b9b2-456bde344700",
        "Identifiant1h": "7fed9622-b90e-486a-8e33-f2e865028b16",
        "Identifiant4h": "cae01509-526f-47ec-a875-71a7e3d5860f",
        "Identifiant8h": "3bafd940-a0a1-4595-943f-8ca3c4d7361a",
        "Identifiant1day": "6f5de4a4-def1-427e-bd21-583fea8a6acf"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_FACILITIES",
        "VariableId": "8b93ec59-fc40-451c-9502-e772b8be76da",
        "Identifiant5Min": "3bd8fb15-4a47-4e80-96c2-73249a6c768b",
        "Identifiant1h": "50294636-4c31-4299-9fa8-805d9500584f",
        "Identifiant4h": "b0f6f065-af4b-484b-91d0-585a4a72af8f",
        "Identifiant8h": "be34a0fd-833e-40c6-8630-adc2cd0cf264",
        "Identifiant1day": "e0166e30-f115-44e2-b3ab-312a41b5b188"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_FACILITIES",
        "VariableId": "a581a98b-8a08-4073-97f3-cb6043cb9cc5",
        "Identifiant5Min": "01bd16a2-6dcd-4ef2-b5ea-8551b2857085",
        "Identifiant1h": "c05307c0-23bf-47eb-be22-daefe7360d6d",
        "Identifiant4h": "cb6c7c32-704d-4ca7-be39-c6874a7d8137",
        "Identifiant8h": "444c86b5-ce0a-4f4b-969c-b93266819930",
        "Identifiant1day": "f8e406bf-5213-4a74-a325-e0e580b098c3"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_FACILITIES",
        "VariableId": "2f2285bb-0373-45ab-bc40-c0892097a7b9",
        "Identifiant5Min": "3bca394c-bd97-49be-a8ef-6c7ebdac7d3a",
        "Identifiant1h": "85efd031-977f-4d03-b613-9bbcf0c20920",
        "Identifiant4h": "6e32086a-a5ef-4b0b-98c6-67c16e37d754",
        "Identifiant8h": "1bb0d740-0f60-4fc5-98f1-7b3bda010bc0",
        "Identifiant1day": "8c862d89-ee47-4421-b68c-1a14a4028a66"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_FACILITIES",
        "VariableId": "f017db3f-8b48-4645-8263-946be21a2aeb",
        "Identifiant5Min": "19af6360-33ea-41b1-ae05-e3ed0cd9a986",
        "Identifiant1h": "627a7d29-e343-4156-ba5d-5d3e4abb0f72",
        "Identifiant4h": "4e90512d-ffb6-4ae7-9690-92136cdc1224",
        "Identifiant8h": "9672a351-3146-4dfb-aa05-d0312141eb6d",
        "Identifiant1day": "b8a4071d-24b0-4e99-8417-eec8a4cb41a6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_FACILITIES",
        "VariableId": "e980df26-b83c-4f08-a418-357fd8df2640",
        "Identifiant5Min": "89d0d332-dd5c-453a-b1d7-0003278c20aa",
        "Identifiant1h": "2f8115c2-ffac-4d8c-a91b-e8a06586acca",
        "Identifiant4h": "8a633d0a-4d63-428f-9530-2807f79e7005",
        "Identifiant8h": "8d855408-8b23-4087-8d56-3932c5b62be6",
        "Identifiant1day": "d6102525-6aed-44eb-acc9-0b7d8ddfd0d0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_FACILITIES",
        "VariableId": "5a245e26-7483-48cc-a86a-c3a928c23304",
        "Identifiant5Min": "c15e00d6-69cb-4ec2-b7d4-f634e92e2fed",
        "Identifiant1h": "d77d2630-0f94-49f8-bea5-85b9c5b57c51",
        "Identifiant4h": "794263df-b8c4-4111-848e-da2dc2f7d1f6",
        "Identifiant8h": "d8ca9e22-e551-4f16-821a-55a8589fefda",
        "Identifiant1day": "1751da11-1270-4c79-8dda-97033bbcce6b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_FACILITIES",
        "VariableId": "d845878a-d549-407e-81a9-c11becf52178",
        "Identifiant5Min": "c34e8d15-21c4-452c-ba6b-b8b31a326e20",
        "Identifiant1h": "318f45f3-dbd2-4091-8655-6d8bc36d77d7",
        "Identifiant4h": "07a25442-70c4-48e0-95c0-3c73f996484a",
        "Identifiant8h": "b18b11b7-83fa-4d6d-8250-650c70ec7d1e",
        "Identifiant1day": "97cc7b2f-6933-494a-a490-315f29b67f24"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_PRODUCTION",
        "VariableId": "55b3d756-8e05-4d71-9567-a1e6e44fc088",
        "Identifiant5Min": "cf077ebd-9fd7-4559-a296-a122ca5ec4cc",
        "Identifiant1h": "6bc0a088-0736-4b6c-9625-88c032f47d97",
        "Identifiant4h": "33d2eb6a-e577-4f95-bed0-1731727b74a8",
        "Identifiant8h": "f7f4efbe-aa02-4505-849d-6f2fc8a9fa87",
        "Identifiant1day": "38689c7d-1642-4cbf-9f67-4e6762941ce4"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_PRODUCTION",
        "VariableId": "6d2d9559-1cae-49c5-afde-007e5a6f936d",
        "Identifiant5Min": "23f84aa5-8544-4058-857c-44707a2f8370",
        "Identifiant1h": "a12e4fa1-2885-4929-9c72-bad5bcebd1f8",
        "Identifiant4h": "a81186c3-f15a-4914-bbe7-7236a6e9193f",
        "Identifiant8h": "102dc800-9fad-4b5b-accf-e882721b34eb",
        "Identifiant1day": "b1f834be-7855-415b-9a08-c87516991651"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_PRODUCTION",
        "VariableId": "a719d178-a6b6-490d-bb70-224871d3de4a",
        "Identifiant5Min": "789bb417-cc7c-48df-9c19-9a2cdd2b8ad4",
        "Identifiant1h": "f0340b62-9685-4530-9f19-2586a88b7973",
        "Identifiant4h": "155af264-4dc9-4018-abd8-beed62e97d06",
        "Identifiant8h": "aca331d3-3b9d-4941-977b-2f1548fb482a",
        "Identifiant1day": "eb47df6b-c83b-4b24-adab-8a1ceb519004"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_PRODUCTION",
        "VariableId": "23469df9-c293-4285-9b47-a4cba2fddf8b",
        "Identifiant5Min": "9e6ac42c-a150-4f3a-a5e4-dc739a5cde34",
        "Identifiant1h": "6cb20716-95bf-4e87-87df-33a3b96d0045",
        "Identifiant4h": "95fd0c04-2009-4dcd-a817-2a55e4ab6ec9",
        "Identifiant8h": "26833586-1afb-46b2-beed-a868607742b7",
        "Identifiant1day": "5ec7c585-4bb2-40a6-9057-44caeaef58cc"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_PRODUCTION",
        "VariableId": "ee995451-1e65-49e6-a3c8-a43698e811ad",
        "Identifiant5Min": "e31c468e-bfe1-405a-9c13-035c191093a1",
        "Identifiant1h": "0d3620bb-a5d2-4c79-86f3-cfb3f95b3c8c",
        "Identifiant4h": "b033c6ab-e34b-44b2-952e-6af483b65f4d",
        "Identifiant8h": "d634d6ca-0027-4fbc-9708-57d7dec46a87",
        "Identifiant1day": "106b272e-ce8f-4fc4-a38f-dd1ab592ef3d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_PRODUCTION",
        "VariableId": "5e4805be-f73a-4691-9ba7-87afeb0d1aae",
        "Identifiant5Min": "6bdffb25-7ba3-4002-825f-1346e48fd88b",
        "Identifiant1h": "8f17ea98-9b28-4cac-bf4e-a6c8f36990de",
        "Identifiant4h": "18544ac1-4b74-44b7-ab9b-931cc71162c0",
        "Identifiant8h": "fc56a753-9cd4-401d-895e-c1e7618bf7f1",
        "Identifiant1day": "d44b96d2-73ad-4647-9b1e-ef6330af6bca"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_PRODUCTION",
        "VariableId": "f509a4cf-fe51-4c45-ae02-0a911fef31a4",
        "Identifiant5Min": "4086f5f8-10b4-49f0-905d-376e593ca03d",
        "Identifiant1h": "6d447ee3-f071-4ffd-b6b6-0203f57af735",
        "Identifiant4h": "d99cc8d1-2891-44c3-9439-5204bc34b95f",
        "Identifiant8h": "25960f67-f318-4637-bd40-67281b3c49db",
        "Identifiant1day": "96078987-0678-4058-9cd0-19d208e963a3"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_PRODUCTION",
        "VariableId": "91ff94bd-5e35-4ce7-86c7-463c67b837dc",
        "Identifiant5Min": "803e381d-fb95-4ab4-81c7-ef5ef099bf76",
        "Identifiant1h": "cfd8a154-30aa-484b-976f-b80ccec3bdd7",
        "Identifiant4h": "8f1b3fa2-101e-412b-8e63-6837aed7e519",
        "Identifiant8h": "7b0ff87d-eb40-49d6-bd14-a23fc5ec028c",
        "Identifiant1day": "ea5f8a35-916f-4682-9470-888049a8ec86"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_SUPPORT",
        "VariableId": "928d8cf0-e9e8-4cfb-968b-6f6fa078fb07",
        "Identifiant5Min": "f81cd7e2-404f-49ea-89dc-618375f890f8",
        "Identifiant1h": "c6330f31-c1a2-414b-a583-9cccbf670642",
        "Identifiant4h": "85aaa8c9-c623-49c7-932e-58ccb27271e1",
        "Identifiant8h": "869f1115-8b85-4038-af20-ed3d0b0c40b4",
        "Identifiant1day": "ba2efe8a-31ef-49b4-bcc9-e3c722681266"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_SUPPORT",
        "VariableId": "c4e0cce0-8984-4251-842f-c901047145e4",
        "Identifiant5Min": "cb62c787-2402-4957-a15d-b176dd20b6c0",
        "Identifiant1h": "8acda784-543d-437d-890d-ccad3945a531",
        "Identifiant4h": "d7bcbab9-9cae-46c9-ab0f-0bec1f58b397",
        "Identifiant8h": "6d4f18a9-a97d-44e6-8993-2e4630c2dfdd",
        "Identifiant1day": "eb5e7744-8637-49e7-9015-a67d6df6da2d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_SUPPORT",
        "VariableId": "43dbe0c4-68e0-4646-bd3e-ae539097a5e1",
        "Identifiant5Min": "5b9e0f06-c30f-4f59-ac82-9466f23b5a3a",
        "Identifiant1h": "038d2bdc-aa78-410f-b648-902bcd50d013",
        "Identifiant4h": "d32334a1-e606-494d-8f89-88ae69bd1ce2",
        "Identifiant8h": "ad08936e-2820-4b28-a005-60bf4d25918b",
        "Identifiant1day": "13b20747-30cd-4abd-b1f6-8e9e9999eeca"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_SUPPORT",
        "VariableId": "53518f6f-deba-46b7-b812-d893b75bb9c5",
        "Identifiant5Min": "ea8a6c7b-3f27-41c3-a2d0-3420546277bd",
        "Identifiant1h": "c68cedde-ba08-426d-aff1-5ff8a326ad8b",
        "Identifiant4h": "7a1efebf-c303-4f7d-99c4-7c681fcf18c4",
        "Identifiant8h": "6f3ccbbc-8fb2-4673-a1ea-e1fc63ca942d",
        "Identifiant1day": "bf5b64ba-4cfe-4d20-8df1-98633a1e888e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_SUPPORT",
        "VariableId": "d339c861-8275-4204-b8de-921599127c32",
        "Identifiant5Min": "24bd8121-a847-4f96-9842-74036adbd206",
        "Identifiant1h": "e14ebe6b-cb34-40cc-822c-4cabeaea2f8b",
        "Identifiant4h": "588c83df-3090-4389-be97-0e799a806698",
        "Identifiant8h": "37561e95-4f05-4858-b381-22eb92d28c89",
        "Identifiant1day": "48f1d6ae-d39b-42f6-a223-023430ee66ce"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_SUPPORT",
        "VariableId": "c10ebbc8-552c-4bcd-ad26-107969d664a0",
        "Identifiant5Min": "2b91585a-059b-401b-ad2a-bc708c41aedd",
        "Identifiant1h": "5762a39d-6474-45bf-a85f-4bc885644c27",
        "Identifiant4h": "851e1a1d-e6b1-44da-8aed-ffeeddab51fb",
        "Identifiant8h": "d96b2d2a-6fc2-49a0-9a67-769a1125b4ec",
        "Identifiant1day": "d579f03d-4c49-44a7-afe4-ef43b64934d6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_SUPPORT",
        "VariableId": "489cdcf0-58ad-4660-b8a4-03b6f075e488",
        "Identifiant5Min": "ed4f1d04-155b-4895-b286-ca99bd3371cf",
        "Identifiant1h": "237855b3-1e98-4bca-813d-77540cd22fa7",
        "Identifiant4h": "b27c5968-5d94-4106-8981-cc94ca7edcbc",
        "Identifiant8h": "a657b863-61ca-4f7d-83d3-00258146e27f",
        "Identifiant1day": "cbf10dc0-9026-4286-b2a8-cde90233b342"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_SUPPORT",
        "VariableId": "4663a335-540a-47d4-94f4-f97ac2dd943e",
        "Identifiant5Min": "e38b0abc-f92d-4223-a858-290a9fd15844",
        "Identifiant1h": "0f0d1b9e-3cd7-4401-926a-ba053f0e6dd5",
        "Identifiant4h": "eb73697f-261b-47b3-9180-a667247157d7",
        "Identifiant8h": "f333105e-4bb4-4170-b9b0-f2d981873bed",
        "Identifiant1day": "a5113cca-6f03-46ab-a51a-351d79ff85b8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_GROUPE_FROID",
        "VariableId": "9f0da38d-42b9-4a8b-a3c1-7c7fbbfdc197",
        "Identifiant5Min": "3309e6e5-db98-4b93-a9b7-0a4fa671b0a9",
        "Identifiant1h": "8c582d33-af71-47e1-8983-cdeeb0ba35a0",
        "Identifiant4h": "d27de828-24d3-4a4f-84f0-0585b05670ea",
        "Identifiant8h": "132b79f9-f755-46d3-8841-eb559e3995bd",
        "Identifiant1day": "dcde15fb-7f73-4f93-9b29-81b475b8580d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_GROUPE_FROID",
        "VariableId": "86d7a8a4-90bd-418b-a620-7f900d69ec84",
        "Identifiant5Min": "a8321010-1c4f-4e35-b44d-74b968e569cc",
        "Identifiant1h": "7357fa16-8e8c-46dd-a1f1-b5ddce3bf5b8",
        "Identifiant4h": "b0ebc39b-2d60-4d13-b3e6-e4c4d221d5a1",
        "Identifiant8h": "ced42666-365d-4362-bf3e-c143dcb0af69",
        "Identifiant1day": "2d1db55e-7633-447b-99ab-464534f2cce6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_GROUPE_FROID",
        "VariableId": "46c280e2-592b-4d48-a38c-e7ad9708ae55",
        "Identifiant5Min": "61dc9dd1-2ca2-437f-a0a0-61258829cda5",
        "Identifiant1h": "373daafb-5ff0-4b30-82e9-3093da2f38be",
        "Identifiant4h": "3b15ec6f-825a-4b03-88ce-9afc60b1de72",
        "Identifiant8h": "a6765470-da90-44c4-a5ac-4458b86dfa51",
        "Identifiant1day": "24bc4a55-e5f1-4eeb-8945-f632a74a05a0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_GROUPE_FROID",
        "VariableId": "d2a7670d-99b1-4642-9c30-6ac78c21d85a",
        "Identifiant5Min": "399e2770-9eb7-442a-b42e-3f054c9e5a3b",
        "Identifiant1h": "e32afa0d-269e-4ffd-a206-bd929ed2e8ff",
        "Identifiant4h": "e1dcc035-8b9d-4a36-ba89-7c1433520a7e",
        "Identifiant8h": "ed606ad7-9d6f-43a3-bb24-0fa6e3e39a83",
        "Identifiant1day": "c8cadd30-a000-4413-9d53-7d3b1b3efa69"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_GROUPE_FROID",
        "VariableId": "223f0965-2761-4b0c-879b-8c3d667c29ea",
        "Identifiant5Min": "4f6e96e3-cd4d-441c-9f11-ed3f3cc8ea73",
        "Identifiant1h": "d095f819-652d-4bed-b8ad-6e3fc0c7c3f8",
        "Identifiant4h": "cd595c04-450c-410d-8b0e-849a7598530c",
        "Identifiant8h": "d7fe5c94-78b2-49ce-ab58-84040dacbeaf",
        "Identifiant1day": "31be2d29-2605-49db-ae05-c619a0a8a416"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_GROUPE_FROID",
        "VariableId": "ca5ed007-435b-48ad-9283-dd86fecd22bb",
        "Identifiant5Min": "9e213e29-63e1-493c-99c7-233c1f812059",
        "Identifiant1h": "999ec8ad-f49a-4380-9e22-c904970ec850",
        "Identifiant4h": "66b85f59-b7cc-420c-beee-f56004913768",
        "Identifiant8h": "aa8105db-f8b8-411c-a46e-d7b6becd084c",
        "Identifiant1day": "82a7a90e-34c7-4a97-aa02-561bc7fff436"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_GROUPE_FROID",
        "VariableId": "1f5dce38-07d0-491c-b82e-4c9418523655",
        "Identifiant5Min": "13eaebef-4cb3-48a7-acc9-13fc801dad62",
        "Identifiant1h": "79fc70d2-9051-4d94-bef9-65c710381316",
        "Identifiant4h": "c93352db-575a-4423-adb6-5c5f09031dac",
        "Identifiant8h": "9c2cd601-902e-421e-ae4c-0c3d7c5dcc51",
        "Identifiant1day": "d7723b96-0259-4b19-9a88-7098bf81ece5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_GROUPE_FROID",
        "VariableId": "c936f3e9-2a6e-4aa2-a197-eb751ce4f38e",
        "Identifiant5Min": "db4f5669-b83e-44c5-979d-23079c6142ff",
        "Identifiant1h": "9f9a54b5-6d13-4bf1-8c1a-a1884b31af8d",
        "Identifiant4h": "feeb3eb1-cb18-498d-a040-433a307b69a9",
        "Identifiant8h": "98bf0b85-a146-4e68-b3b6-bf8499f19489",
        "Identifiant1day": "e1a49cbe-60a2-41c0-9d0a-3302ede30f14"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_EAU_INDUSTRIELLE",
        "VariableId": "d4e18920-8ee2-4d48-a79a-486f21905abe",
        "Identifiant5Min": "56415bf4-ed74-4d35-a232-681b641558eb",
        "Identifiant1h": "8b109a7a-c0d1-4288-b954-a0b83d4a90cd",
        "Identifiant4h": "4c838fad-8fa8-4a87-bc41-71c3cfc3a9a8",
        "Identifiant8h": "f49b4c0b-ced5-4304-a28f-7041f547e33f",
        "Identifiant1day": "49a5c8d6-feef-4658-9f08-d1c1b714b54d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_EAU_INDUSTRIELLE",
        "VariableId": "f6370690-5c13-4a58-93bb-9a297d2ab29c",
        "Identifiant5Min": "527bb00c-2995-4055-b320-1436b52cbb0c",
        "Identifiant1h": "65969cc2-1ba1-4b1a-a8c6-d6c964b5c938",
        "Identifiant4h": "5c679fe6-7da7-47b9-b83f-701c755f4d7b",
        "Identifiant8h": "732e16dc-4bcd-4829-bed3-6833462b9247",
        "Identifiant1day": "9e46e6ab-e110-4b06-8f17-bf0ca919e949"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_EAU_INDUSTRIELLE",
        "VariableId": "fce6e196-118e-4421-a7c2-d8d9c0d81f12",
        "Identifiant5Min": "0f0cfc5b-9f76-4f5c-a804-843bd1ce6614",
        "Identifiant1h": "8b5de607-28ec-4cbc-99e5-801f4f267f8c",
        "Identifiant4h": "0cb3f61f-b4f5-4667-87c0-310b166a5ce5",
        "Identifiant8h": "7f1522ba-6119-483a-a95c-f1da96dd7a3f",
        "Identifiant1day": "94aec4da-4cab-4807-bf97-4b04b6288ef9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_EAU_INDUSTRIELLE",
        "VariableId": "226de2b5-6056-485a-bb12-1429c2d3ac8b",
        "Identifiant5Min": "9387334b-8b1f-466a-8f69-de41bab23538",
        "Identifiant1h": "8f987463-5297-4729-8418-22b6c5a960c6",
        "Identifiant4h": "ed08898e-d1bf-46f1-8194-0ba6de2bf901",
        "Identifiant8h": "8e80e2db-d0e4-4a83-91c4-cfaa0d25d768",
        "Identifiant1day": "679a6254-d803-4853-b5a3-563302d4ad3f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_EAU_INDUSTRIELLE",
        "VariableId": "dcc32cb3-341b-4a8c-8488-9ecad31f907d",
        "Identifiant5Min": "15ce9225-2e34-477b-9973-11427f2c93e6",
        "Identifiant1h": "c56a8758-ce0c-4ed8-93c1-cee6f3d38832",
        "Identifiant4h": "89ffe973-987b-48ad-9e15-51083caaad04",
        "Identifiant8h": "9d079126-a6ad-412f-b799-b9d67d41b1a8",
        "Identifiant1day": "7c2e3d4c-3989-4161-a845-74a143c67de4"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_EAU_INDUSTRIELLE",
        "VariableId": "6c722b72-9ba6-40c6-b733-316a93a67773",
        "Identifiant5Min": "a8e99911-7a7b-40ca-a2ea-fbff503be9dd",
        "Identifiant1h": "1a52c49d-6e51-47a9-9963-c22f6430757f",
        "Identifiant4h": "ec6ced88-b2ad-480c-871f-9366236473a7",
        "Identifiant8h": "d4d062f4-de81-4982-b551-d6b7964b2eea",
        "Identifiant1day": "f3809f99-5a92-4fb6-87b0-a71ba6c4d02c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_EAU_INDUSTRIELLE",
        "VariableId": "3a0de895-8185-4263-819b-b1bbbbb7646f",
        "Identifiant5Min": "452c64cd-b3c5-453c-b8d0-fdcc3c85eab2",
        "Identifiant1h": "f5f0624a-35a0-407b-ba7d-1c2833ea0ade",
        "Identifiant4h": "d7c08cf3-9f19-489e-80f0-e00822854b9d",
        "Identifiant8h": "7454e1fd-a990-40ab-92a6-a379f995d64a",
        "Identifiant1day": "7cbbac56-790b-4a4c-8912-42ba7d7ed123"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_EAU_INDUSTRIELLE",
        "VariableId": "15ad3dcc-a5ba-4d40-9d87-d9d30d0594b7",
        "Identifiant5Min": "4129294b-eb13-476c-91f9-af52c572e510",
        "Identifiant1h": "7b3bc2c0-3b94-4559-a295-7f624ce590d8",
        "Identifiant4h": "b029ff56-5659-4be6-a3d0-787a66081dcf",
        "Identifiant8h": "5466c04a-1625-48fe-bf6c-1e8765f066cf",
        "Identifiant1day": "cd05d72a-9a27-41c9-8bdb-d8de30928ed8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_CHAUFFERIE_ATL",
        "VariableId": "b9ec65cb-635c-45eb-ac23-89e994988586",
        "Identifiant5Min": "ca735b7e-5ba2-4089-b090-1cc4e7937541",
        "Identifiant1h": "e62d09d5-a6a1-47a9-8927-5f9c949a8e8c",
        "Identifiant4h": "fb8acdeb-fc8d-4606-af8e-2553e123755f",
        "Identifiant8h": "94248fdb-875c-4155-9d7f-e4b13e1a8e01",
        "Identifiant1day": "4d2b9991-ceac-4ac0-9377-e0d6008428e4"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_CHAUFFERIE_ATL",
        "VariableId": "dd320835-22d4-46ae-9f1c-d6278a1bdd5d",
        "Identifiant5Min": "d2c5b61a-3fbc-47d6-a238-2a39b6b4a43a",
        "Identifiant1h": "ddb9bf9e-a9b8-459c-a2ac-1312b2bef054",
        "Identifiant4h": "73b79e42-e802-4f34-8f96-71c2d64d64e8",
        "Identifiant8h": "2aca1a88-78c3-4ba0-bfe3-35697f123df4",
        "Identifiant1day": "804cb856-eea0-43f4-ae20-b3c20090f346"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_CHAUFFERIE_ATL",
        "VariableId": "07162b93-b103-4e50-9ffc-ae169e8c20c6",
        "Identifiant5Min": "a5c49f0d-7f3a-4f9f-a8ca-6b00757a3a9e",
        "Identifiant1h": "ec508f12-132e-4795-a10f-9955fcc85f27",
        "Identifiant4h": "b30489fd-be4a-49de-94b2-86556467780d",
        "Identifiant8h": "e24754b2-a2bb-4a3d-9247-deeea336c64a",
        "Identifiant1day": "b761ba02-369e-4166-80f3-ae0d8d4cc649"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_CHAUFFERIE_ATL",
        "VariableId": "b4788e8b-bd07-4532-a217-f6be8388a0a4",
        "Identifiant5Min": "39f2a4d5-18e9-4445-87eb-a2fdb6011e99",
        "Identifiant1h": "97dde2f6-3ece-4832-877a-5197c8c8780b",
        "Identifiant4h": "6329cf8c-83f7-46c9-b26e-3ada8567a9f6",
        "Identifiant8h": "0ffd898f-c260-406f-bcf7-577d5d656c60",
        "Identifiant1day": "59fd41aa-f6b7-4f7a-8862-3f62b5ee7c35"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_CHAUFFERIE_ATL",
        "VariableId": "0194eeba-5748-4270-bfca-310c405fd71e",
        "Identifiant5Min": "ec667e6f-3cf8-4ae7-9296-982da23cb692",
        "Identifiant1h": "2c6b4005-95e3-4f6e-925d-d5ef6182b014",
        "Identifiant4h": "5ad1fc64-362c-46b1-ad17-0a7291b7babe",
        "Identifiant8h": "c4a40297-591b-4cfd-88a2-61512bd69ec9",
        "Identifiant1day": "12ca5f59-b0ca-4ced-9c43-18dbf2d28db3"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_CHAUFFERIE_ATL",
        "VariableId": "736369ca-6ac5-4bb2-b553-bca8f4d13170",
        "Identifiant5Min": "03e22bf4-5d5d-4bd2-8f58-f0f8475b4cfc",
        "Identifiant1h": "f8918741-2968-47ca-b38d-831dffe2a370",
        "Identifiant4h": "7c3a5002-8526-4f20-be61-23a8b1813cbe",
        "Identifiant8h": "138b6319-ab2a-492c-be4c-0ed559fc2083",
        "Identifiant1day": "bc802efd-7239-4b55-a1a7-531a64b51318"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_CHAUFFERIE_ATL",
        "VariableId": "8f38418b-6e4c-4209-ad08-888d58cd7e9e",
        "Identifiant5Min": "fac7d653-4b77-4494-a792-41524e382bd2",
        "Identifiant1h": "d7fb8c76-69a6-4eb2-90a9-abbcc1dc453f",
        "Identifiant4h": "c4fbbce3-1546-460d-9f58-01979e2362c1",
        "Identifiant8h": "2d6b1b89-ae92-447d-a774-48d829f02d41",
        "Identifiant1day": "a6876436-ad86-4cde-bb4c-2b607e34d352"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_CHAUFFERIE_ATL",
        "VariableId": "49c40ce6-8e92-4fa7-a376-0d94c511b8d2",
        "Identifiant5Min": "ba1c7659-99e6-4522-aea7-4e6218edc6ea",
        "Identifiant1h": "73736125-9a30-43a4-8079-a53ef3f0d088",
        "Identifiant4h": "6f26f7ab-1c0d-4dcb-9fd6-4304b159e43f",
        "Identifiant8h": "93ffc0d5-96e0-4c2b-9414-b41795a28691",
        "Identifiant1day": "ce457544-3638-4ac6-9ada-0717b85bf7cd"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_LT3",
        "VariableId": "2f246d36-cdac-43ee-91de-97551a39913f",
        "Identifiant5Min": "04ecb1aa-f9d1-4fcc-9dda-8627da4e4813",
        "Identifiant1h": "143a8667-0983-4f77-a805-d1dcd6546fc0",
        "Identifiant4h": "0824634e-72ed-45ce-80d6-f02d06534480",
        "Identifiant8h": "4e592832-1b78-4341-854a-28f59b56af20",
        "Identifiant1day": "34284b30-853a-4688-9776-1f059ddad03e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_LT3",
        "VariableId": "1bf33589-a80a-47ef-ae5f-6129a4eedd56",
        "Identifiant5Min": "621a829f-ef8b-4a16-bef4-e3c0867b24d4",
        "Identifiant1h": "e639a3ad-1dd1-49c7-9299-b39f84a8ceac",
        "Identifiant4h": "225c3760-36a9-452d-8a3a-aef75c569913",
        "Identifiant8h": "ace82ea9-8546-4b0d-8d08-0513747967a6",
        "Identifiant1day": "e713c6e4-fa6c-4167-a36b-a1e79881d5bd"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_LT3",
        "VariableId": "595d011f-f68e-4fcb-80f0-5056a8e8487c",
        "Identifiant5Min": "14c1e79d-a1a5-4ad3-9a93-7b5fbc4a35de",
        "Identifiant1h": "e8da1e52-ea62-4235-afe7-989c6a6d20dc",
        "Identifiant4h": "36d5de68-5390-4995-b326-6bf8faf5f3ff",
        "Identifiant8h": "5891467a-c477-4462-9409-dd4b99e809f4",
        "Identifiant1day": "59abd72d-1baa-4b80-b5a7-2b87d3bb125a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_LT3",
        "VariableId": "4d7ad137-800f-40ff-a6c2-76f84b50577b",
        "Identifiant5Min": "833660c8-f984-41a0-b396-0e8d6045b8e9",
        "Identifiant1h": "a682a44b-3d81-4d68-b50b-d921e7f336a4",
        "Identifiant4h": "7d56eb31-b613-42db-9d44-146a6fc61d5c",
        "Identifiant8h": "ba960555-7cad-433d-8b35-fc2720a33432",
        "Identifiant1day": "b60fac0a-9356-40a2-a6fb-1c9ca0902d41"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_LT3",
        "VariableId": "6459064b-561c-4c2b-b4f5-3ab6f991095f",
        "Identifiant5Min": "0c981420-243f-4036-a38c-ab4bfcaad605",
        "Identifiant1h": "dc9a35f7-2eaf-4ad1-8392-993388845957",
        "Identifiant4h": "a973669b-34b0-4ef5-b9cc-12195b3a003d",
        "Identifiant8h": "11fb2930-6b41-465b-b21e-edc02f8a2f72",
        "Identifiant1day": "c7fa9569-d7bd-4a34-9ab8-9a0035cffc1f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_LT3",
        "VariableId": "57314055-ff3a-4d18-979f-6e109dd049f4",
        "Identifiant5Min": "0cc163ad-bf5d-4e53-8f9f-62ee0c43ec34",
        "Identifiant1h": "f65a3114-b2cc-4a1a-94af-bb34295a6e0e",
        "Identifiant4h": "72429661-2a75-4fa2-8e82-9eb4f95076b7",
        "Identifiant8h": "5fc4b6c4-d22a-4de0-b3bc-99746df349d9",
        "Identifiant1day": "9e77e965-cd96-47e9-82a3-34b110571f8e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_LT3",
        "VariableId": "7f03827f-57e3-43a4-b6f9-53d1302a9b4f",
        "Identifiant5Min": "1f1fc420-2025-495f-a594-3ebe877fbc12",
        "Identifiant1h": "99dfe35a-266d-4668-b7d6-c51aca4e0308",
        "Identifiant4h": "8712a70c-1940-45b6-bf25-a621e95c2e78",
        "Identifiant8h": "96610603-d368-4f81-844b-54cb43176037",
        "Identifiant1day": "a3be6528-ade5-452d-8f0f-ae967cfedc93"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_LT3",
        "VariableId": "087ec78a-06b3-4bf6-b7ae-fb2296c82423",
        "Identifiant5Min": "1a27ec39-ee7a-46e5-947e-6dc382a1bf3a",
        "Identifiant1h": "f1f65a57-6aa6-41d9-adcb-f7c665f0f6ee",
        "Identifiant4h": "cadb51eb-dd07-451a-9305-7095a37626ed",
        "Identifiant8h": "c6549efb-15e7-4260-89d6-e81d9be76ee7",
        "Identifiant1day": "96f08869-4c01-4403-8b92-66e9d59c75e6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_BATIMENT",
        "VariableId": "57d5ec51-bf7a-45df-8d97-c4007c2dfdd9",
        "Identifiant5Min": "0564228a-af12-4a55-8d1f-9dd66b4eb093",
        "Identifiant1h": "b2193762-ed51-4a53-9bb7-2443b9c8ccca",
        "Identifiant4h": "bd0aee67-daeb-40cc-9e54-f8706e193838",
        "Identifiant8h": "0bb0422a-02f3-4319-bc1d-3887aa0f2506",
        "Identifiant1day": "a804ed25-942f-4bca-877f-d806927d99e4"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_BATIMENT",
        "VariableId": "7d702eb6-2875-4ef0-a89c-00e4afb55253",
        "Identifiant5Min": "47d3bcc1-94c9-4d39-b515-473f9a8529c0",
        "Identifiant1h": "85ef4e6d-1803-4279-8636-2a6e358d8fa8",
        "Identifiant4h": "39d01bb3-5f65-46da-b8cd-e1b0775952e4",
        "Identifiant8h": "d20e9ed9-4030-426d-a4f6-b04dc6eb75e0",
        "Identifiant1day": "2130baaf-9af6-49b5-8b1a-54ba1c4f26b2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_BATIMENT",
        "VariableId": "f92e98f9-ba23-4f2f-b79d-e94c12d84c83",
        "Identifiant5Min": "d80f6c3a-c9f9-4776-b2fb-04462bc258b5",
        "Identifiant1h": "e492db4d-f806-4ff4-bc26-0b73c35d62ba",
        "Identifiant4h": "5f4cac8a-a54c-4cf3-8b8b-1e38dde30d5d",
        "Identifiant8h": "4d15692a-de7c-4bdd-8688-fc7b81ba7228",
        "Identifiant1day": "4e66eefa-4a3f-4074-9b4c-2f20bdee76e1"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_BATIMENT",
        "VariableId": "d66dc15c-e579-4a22-9615-4ae3c9aae31c",
        "Identifiant5Min": "9cc742bc-b75f-411c-9ef0-e73f02347df2",
        "Identifiant1h": "21982f6b-3981-4d5d-930a-196451925960",
        "Identifiant4h": "b70a1fb3-f0ad-4ab4-a301-f4c44dbf1ff7",
        "Identifiant8h": "7963ed08-600a-4631-84e1-bc115dd83c68",
        "Identifiant1day": "d7d6b548-29b1-4a79-b53b-c6e7c2af6b79"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_BATIMENT",
        "VariableId": "17e8fc06-2b69-47ab-bfe7-e36fadf055de",
        "Identifiant5Min": "755b90e7-117b-46bc-9f9b-9d858644e5a6",
        "Identifiant1h": "b66eca36-cebc-4cb5-8684-0132ee620196",
        "Identifiant4h": "b52bd2a9-ba9b-42f2-b534-f0a0e08b37c7",
        "Identifiant8h": "edbef03e-45d1-4051-a014-c154e5f0d3e0",
        "Identifiant1day": "68139796-1b09-409f-9a02-c916a1ffe80a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_BATIMENT",
        "VariableId": "285768fe-96dc-4710-97c4-446c9b7a28b0",
        "Identifiant5Min": "56e70b91-c9cb-47d4-9dc6-4b311c59bd7a",
        "Identifiant1h": "05b2917d-7c6b-4780-9f1a-fbd77aef25d7",
        "Identifiant4h": "42da6da6-b1c2-4b58-a57e-78a0f8569cbc",
        "Identifiant8h": "fa237ff5-5ed3-4e7d-b3bb-7017ab9eb5a8",
        "Identifiant1day": "354cafa2-4114-4f1f-8046-c28273964e95"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_BATIMENT",
        "VariableId": "da4ddbf6-401e-49d7-a29a-6278f8191207",
        "Identifiant5Min": "1e0c290e-128b-493a-a0eb-1b5d51009dcb",
        "Identifiant1h": "12cc98d6-a15d-4903-ab5e-fd6024313f84",
        "Identifiant4h": "c9933ee4-d929-445e-857f-48ebc236358a",
        "Identifiant8h": "70827bfe-5c07-4020-9ac8-4ad02e6f3027",
        "Identifiant1day": "dd1202df-2354-4288-9582-e0de99135b10"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_BATIMENT",
        "VariableId": "b2f2b69c-9798-41a0-bbb9-7e8797b89316",
        "Identifiant5Min": "86fd46af-5023-40a4-b11b-43bce6aeaed3",
        "Identifiant1h": "df4b5c64-8ad5-49e1-b8ce-95de30a1727c",
        "Identifiant4h": "f0e226cc-0f55-4b24-8461-45cb51cdd665",
        "Identifiant8h": "19a23d8f-261c-4a20-b7f3-03034642a9f6",
        "Identifiant1day": "5ddb0ef4-23f7-4948-bab9-a8442b8db18a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_EXTERIEURS",
        "VariableId": "5b348804-ba27-4449-b846-d9512b3e4f7d",
        "Identifiant5Min": "cb6805e2-937d-4f8c-9097-3176f4237cd2",
        "Identifiant1h": "d7a0b202-718a-4c12-9939-295135debae8",
        "Identifiant4h": "5856bf0c-bab3-4758-9dc5-1074e012b4af",
        "Identifiant8h": "eb25b1ba-a61d-4a32-87c1-10e2d7537088",
        "Identifiant1day": "16f235a8-f500-400a-bb00-c6a5e2144ed0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_EXTERIEURS",
        "VariableId": "aac6b9c1-7943-4db6-a16a-1d730d640b1c",
        "Identifiant5Min": "6cf8fc3a-ef7b-4aba-a439-367fbd82d7f8",
        "Identifiant1h": "e834cd71-1518-4357-89da-3a7a25878e69",
        "Identifiant4h": "416fec76-97d3-4800-9fc2-fa9508d12066",
        "Identifiant8h": "ad463db1-1b00-4b4e-8de9-e4cc4a1d1350",
        "Identifiant1day": "d62c6a0b-251b-465d-ab58-600e889b8b3e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_EXTERIEURS",
        "VariableId": "d191c539-87b1-4d8b-b2f8-3aba95adc359",
        "Identifiant5Min": "b171ec92-2937-4ba4-8799-61cd36ae27ba",
        "Identifiant1h": "848de2e0-3df1-49ff-a43b-6f9111dfa1eb",
        "Identifiant4h": "386ac6a0-b125-4a2a-bd71-fd61c8446cd5",
        "Identifiant8h": "6f180a11-df73-4f18-b714-774754df92a9",
        "Identifiant1day": "50e5b7fa-61cb-48ce-92b3-a60219e40649"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_EXTERIEURS",
        "VariableId": "a14b6dcb-06f8-4e10-a729-3e86abe891a8",
        "Identifiant5Min": "860b8732-23c5-45a1-b044-5b3fe6ee5941",
        "Identifiant1h": "e0f3944a-6160-4c16-b641-0c1ef6159820",
        "Identifiant4h": "2d203df4-532a-44c7-a9a9-d98878318732",
        "Identifiant8h": "1c68f05d-5f36-4ab0-8b00-c939632f8741",
        "Identifiant1day": "1b8e4f4c-fcf0-4c68-babe-d4e813c32e96"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_EXTERIEURS",
        "VariableId": "c308cfe1-dddb-4693-acf5-707489731d4a",
        "Identifiant5Min": "57110c40-8ee1-45ef-a4b1-cf692189d320",
        "Identifiant1h": "8b0eed47-3912-4449-b3b9-b362cc991b9a",
        "Identifiant4h": "7357a914-785c-4815-a3e6-4c49e2ee16f8",
        "Identifiant8h": "781ed1cc-5020-4342-8509-c810549ec999",
        "Identifiant1day": "e6645f39-dba7-4cf2-ad1a-0e1303239c12"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_EXTERIEURS",
        "VariableId": "5836a3c5-5ede-48a4-8b95-c78c150dfce7",
        "Identifiant5Min": "b9b0ebad-102b-4d90-82f1-24077de375f5",
        "Identifiant1h": "fad6768c-102d-44df-9220-3239d6e0f510",
        "Identifiant4h": "cf90db80-fd73-4179-a973-bd54ef8de655",
        "Identifiant8h": "5fbb91d5-4cf9-42ab-9ae2-7be64d1761aa",
        "Identifiant1day": "7a6949d8-165f-4120-ae79-2fde68c3caad"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_EXTERIEURS",
        "VariableId": "55468416-9e0f-49b4-92a7-634d8d661af6",
        "Identifiant5Min": "2d80bfd1-8da6-46ec-9ae4-3aea02eb7b1d",
        "Identifiant1h": "fe962178-8b58-445a-865e-499c48ec0ef6",
        "Identifiant4h": "0eaae3c6-f2a3-4cc5-866e-10b0910669a5",
        "Identifiant8h": "2aefb43f-11f8-427c-a7ee-00a87b1e4c8e",
        "Identifiant1day": "e49237db-612f-4382-8a2b-cfe76161e44e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_EXTERIEURS",
        "VariableId": "4a7c742c-bd0a-4ab9-ba82-547c01a25f93",
        "Identifiant5Min": "37b14027-5960-43a7-99b8-78e6b0e3e119",
        "Identifiant1h": "6bda0bda-a609-4864-9085-4a53583e725c",
        "Identifiant4h": "8e98ee7a-f68d-43b9-97ee-b7457447c5cf",
        "Identifiant8h": "4ec3d188-c682-4439-bc13-b34f8935830a",
        "Identifiant1day": "8df24843-3f51-4862-86b1-0c3d613285ae"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_PEINTURE",
        "VariableId": "199081a6-1efc-4217-8f44-0f069d251c5b",
        "Identifiant5Min": "ee644de8-e1f0-44fd-97ad-aa991faa5da6",
        "Identifiant1h": "9e4d19d1-94b9-45a4-b1c9-dc7f00f121bd",
        "Identifiant4h": "5f335a7f-56db-455e-8481-efe7f552282c",
        "Identifiant8h": "e94b862f-5ae1-4f5e-be53-01bbcbd8ecac",
        "Identifiant1day": "c506e159-3cd2-4316-a8fe-90e01435b018"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_PEINTURE",
        "VariableId": "71fb153e-c680-4bf3-b326-5710c0c865ce",
        "Identifiant5Min": "a0b74ac8-5b87-4ab5-b78d-1f083eed1981",
        "Identifiant1h": "1dce64ab-151e-4ed1-8241-fe1720c525c6",
        "Identifiant4h": "f0c91319-5ded-45ea-9592-8165e0b60df8",
        "Identifiant8h": "bd05a4ed-cd4b-413e-93c4-0277ed8e2a50",
        "Identifiant1day": "37fd4ad1-8557-4c71-9bd9-9a3423e3fefb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_PEINTURE",
        "VariableId": "75d74b99-05d8-48f3-9827-320b7324afcc",
        "Identifiant5Min": "775070cc-ddbf-4692-be59-825bea59ac96",
        "Identifiant1h": "83f6d78d-89e2-4203-ad11-05fdcaaec54c",
        "Identifiant4h": "af579518-40a8-4e28-8f96-cd5c38040639",
        "Identifiant8h": "0b90350b-18eb-428a-87e2-2066cb03334b",
        "Identifiant1day": "0b3b6f28-7a3a-4202-ac9c-cd8873042b99"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_PEINTURE",
        "VariableId": "a7311ade-1231-4826-be44-e6be3a0823f0",
        "Identifiant5Min": "d66acede-d83d-4022-963f-d1c404c1102e",
        "Identifiant1h": "5b16c27c-9f5e-4bcb-a6bd-d89854f21dc9",
        "Identifiant4h": "1f4c2e3c-3398-49b4-b33c-0fae78a3ba8c",
        "Identifiant8h": "8d3557fe-2ad9-439b-b1b1-781c27ed8e51",
        "Identifiant1day": "58fbc02f-12bd-4a35-91f5-4933149e78fd"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_PEINTURE",
        "VariableId": "2f9af65d-c59e-4f2a-a9cb-baf779890f4c",
        "Identifiant5Min": "a4c3c138-560e-4ea4-9013-b0aa203ec8e0",
        "Identifiant1h": "34570b62-4a60-466c-8bcb-f53e77d4ad2c",
        "Identifiant4h": "4c828924-bdc6-4838-bd2f-017e3ce93d6b",
        "Identifiant8h": "5884eeb6-b332-4649-9ecb-06194dfd7977",
        "Identifiant1day": "90030c26-3e3f-4226-90d0-a2fe95d1964c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_PEINTURE",
        "VariableId": "e3efbd6d-29df-4b60-84fb-88896f8b1603",
        "Identifiant5Min": "4405f2ab-0975-4e0e-8f91-dc1171634edc",
        "Identifiant1h": "0f89d4f8-0116-4f77-a896-dfddf5673e67",
        "Identifiant4h": "6cd68322-b36e-46f3-b43f-a3d252fd73e8",
        "Identifiant8h": "2133a902-9e60-4725-a28c-7b5a4d1d47d9",
        "Identifiant1day": "f8c17a39-8d2c-4b65-beac-960856b97b1c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_PEINTURE",
        "VariableId": "9d426f06-ad32-43df-be12-ae96b1d40cc5",
        "Identifiant5Min": "f8a6f02b-31cc-4341-adcd-1c96bf6c4d83",
        "Identifiant1h": "d96bc796-7ebd-412d-8f00-5f4f3af3b509",
        "Identifiant4h": "04252a6f-07f8-432b-a776-9b0c636304f8",
        "Identifiant8h": "3d16631c-95ea-47b7-9884-b35471d9ea85",
        "Identifiant1day": "cf4cd239-04e4-4db8-9dd9-2ffe608ea773"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_PEINTURE",
        "VariableId": "3e0e2369-8ce3-49a0-8348-0ed7e75795fd",
        "Identifiant5Min": "b0cdf8ff-a606-4822-8d04-97c75310c4bc",
        "Identifiant1h": "9a1a3350-3bca-48d7-a86f-b8ee1cd0a2fe",
        "Identifiant4h": "576e930d-512d-4dc5-8007-19f0552288f1",
        "Identifiant8h": "756f9ea0-8568-4735-8ab0-91ff1ce0d0d7",
        "Identifiant1day": "f51a7001-6c5d-48b7-b413-1d445428d13b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_AIR_COMPRIME",
        "VariableId": "cb32a653-1951-4ee4-92e6-0423f26c9aa5",
        "Identifiant5Min": "4064c8ca-859c-48ba-b2f4-b4209d2e8655",
        "Identifiant1h": "c9895376-9bb5-4d19-88d1-c98e8472fddb",
        "Identifiant4h": "9e44dea2-8a39-4d80-949f-d518e1a1e601",
        "Identifiant8h": "af587570-36cb-46c0-9f58-9d2a0314560f",
        "Identifiant1day": "4155285f-1275-4b54-b10b-943668ab35b8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_AIR_COMPRIME",
        "VariableId": "b1d8e482-ad68-49fa-a081-b51f4069de1b",
        "Identifiant5Min": "0cfdc281-de15-4fe3-b29e-a28685d1c266",
        "Identifiant1h": "8bee9a68-f54b-4428-bbc5-984656d42740",
        "Identifiant4h": "c62e21b9-6702-4d27-98e5-9a390a7991bb",
        "Identifiant8h": "aef8d7f8-2652-4011-9135-d4e433682eaf",
        "Identifiant1day": "d6655787-887b-4608-a62b-5a3ae85d1d5e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_AIR_COMPRIME",
        "VariableId": "028bb0b5-bc79-4d39-89c8-26edbb272dad",
        "Identifiant5Min": "05bd8f2e-5045-4f46-a2ee-544139a9ebf9",
        "Identifiant1h": "5f6e1030-95b4-463f-b988-10d1932002d2",
        "Identifiant4h": "e3410d73-d0c8-4339-9eb8-7aad25485105",
        "Identifiant8h": "6a50fe27-736a-428f-ae99-e21ed9db9fe6",
        "Identifiant1day": "734d4e23-c5af-4ef3-8d89-f4826630562b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_AIR_COMPRIME",
        "VariableId": "4ff9cb0d-57cb-47d9-8759-da12ad9631b3",
        "Identifiant5Min": "18b39f39-6729-4228-908b-41f49b93328f",
        "Identifiant1h": "d09c8882-1bc8-40d4-a5d2-22b48e55161f",
        "Identifiant4h": "925a9a91-13af-46d9-ba71-c813f0d70456",
        "Identifiant8h": "318c345d-e842-47f0-8e53-71a91e5ca85c",
        "Identifiant1day": "011deaaf-0c25-4e50-b0cc-e7689520ff77"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_AIR_COMPRIME",
        "VariableId": "6f609f46-c1dd-4b5e-b931-8370364f148e",
        "Identifiant5Min": "66544987-1d60-4d70-b1b1-bcfb1d912301",
        "Identifiant1h": "179b53bd-0285-4965-be63-d0124efa7ddf",
        "Identifiant4h": "e1cba3bd-aa93-4c7c-820d-7f3c05b36309",
        "Identifiant8h": "5b3ee9c4-3e81-4d3f-9dcc-d276d9e7304a",
        "Identifiant1day": "a5d45254-9d8e-48a5-90e9-da2e147f51b9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_AIR_COMPRIME",
        "VariableId": "8a3e447b-f875-4842-9b5b-1dc0caaf1853",
        "Identifiant5Min": "bb2586df-ee0d-4672-9698-f55d6486860d",
        "Identifiant1h": "51221d55-816b-46a8-bff5-f28e4ae42f44",
        "Identifiant4h": "e164b687-329b-48d2-b950-798f75660d8c",
        "Identifiant8h": "704ad248-3150-4e5c-b3f8-3c00f50b9c18",
        "Identifiant1day": "09b30d0a-4040-414e-aced-cf881ae0ff06"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_AIR_COMPRIME",
        "VariableId": "b328d7db-3099-4415-8668-d61028c8c13f",
        "Identifiant5Min": "00758b1d-bfd1-4f0f-b93c-990fefbfae1a",
        "Identifiant1h": "e83c9d07-a28f-4424-9cb8-79dea8e2b7a0",
        "Identifiant4h": "4afbeddf-e49f-40f1-b4e3-6441d7603c25",
        "Identifiant8h": "44c63d12-de8b-4591-adb2-9aed27cdc7e8",
        "Identifiant1day": "cdd580e9-4a7b-4877-8c14-4fdd24e83d0d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_AIR_COMPRIME",
        "VariableId": "22c96e6f-ee67-41d7-9d94-0086be24a71b",
        "Identifiant5Min": "34af8c31-4c20-4a09-99e6-648c88117a9c",
        "Identifiant1h": "6640747d-8563-4584-a45a-68eb8ececc41",
        "Identifiant4h": "77f96a1a-c69f-4be1-930b-aa3f428dc327",
        "Identifiant8h": "5166b237-5ac1-4ac6-8bdd-29f841161665",
        "Identifiant1day": "a356f9de-a269-4df9-adce-f84e71c16085"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_LT4",
        "VariableId": "1f86af57-1765-4c4d-a329-5897648700c4",
        "Identifiant5Min": "eb94036d-6f5e-46ed-b609-7aec1712949d",
        "Identifiant1h": "9a7abbbe-c2d6-462e-9095-08531191ad35",
        "Identifiant4h": "23ddd07e-4c0f-4c4d-9d0d-69f56981879b",
        "Identifiant8h": "44138d33-a71b-4670-8401-48c8a26dc0dc",
        "Identifiant1day": "2f57082e-f55c-4a4b-b5d9-98aa5692abdb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_LT4",
        "VariableId": "9a85961c-f510-4a8a-ad5c-9325c0539444",
        "Identifiant5Min": "6ec427da-16ac-4b92-99aa-373d39577e1d",
        "Identifiant1h": "be5bb7a2-31e2-4e6a-a813-0301d7c6e65a",
        "Identifiant4h": "e851a42c-c4af-47ee-9a3f-298db8b1bce8",
        "Identifiant8h": "4aabb4fb-5c89-45ff-8f70-d229303f19a6",
        "Identifiant1day": "dd5d4f89-e6d6-4b6f-9e96-889023555de2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_LT4",
        "VariableId": "9ca58d07-f50a-4035-a34c-dd6b6e4d8419",
        "Identifiant5Min": "7ed09319-0565-4f81-b6c7-941fb71e9a4e",
        "Identifiant1h": "b1f91f23-1416-454e-8a86-0e36e39ad720",
        "Identifiant4h": "d35f4815-5374-4b30-81d1-e1bd751c0987",
        "Identifiant8h": "38402b45-27ac-4536-ba51-769914ff8636",
        "Identifiant1day": "53d59027-0a11-4512-a4d5-5fcb2a544fbb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_LT4",
        "VariableId": "322a498c-b63e-4985-bd6e-2d00f2e18076",
        "Identifiant5Min": "daa0ad35-8d54-4889-aad2-6a675f82e2f5",
        "Identifiant1h": "220aa252-88d2-47a7-8188-0092d4d9f1c6",
        "Identifiant4h": "749d2572-292d-428b-97c1-fffe9c8e5ce0",
        "Identifiant8h": "ce3c7fce-26ec-462e-bba4-38e6b5f6475c",
        "Identifiant1day": "f587c67d-1542-4049-8c52-33fd842c746c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_LT4",
        "VariableId": "99d860f0-e549-4280-a2b3-7252bbbc8b60",
        "Identifiant5Min": "fba1f67a-76d4-45de-829e-6cf7a42b80ef",
        "Identifiant1h": "0f81a41a-2edc-4ff7-8b7f-37326e6d873c",
        "Identifiant4h": "c3f7caf8-6654-43b3-aa16-f36cdc91cb34",
        "Identifiant8h": "a73523af-f44b-4f29-8e05-f1326c50f9f3",
        "Identifiant1day": "3ac2a7ba-5b4d-49e9-9c2a-22ae8d115471"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_LT4",
        "VariableId": "ddb8c8ce-4370-4775-a77a-680ddc1d1951",
        "Identifiant5Min": "67558546-a7ab-4e31-b96b-50d227625fad",
        "Identifiant1h": "c53bfd76-a342-4c39-88be-3277de223a1d",
        "Identifiant4h": "662fc3d8-be10-4d24-bd4e-43dcaa628101",
        "Identifiant8h": "06cf1ad4-84e5-4982-874b-effa79a92820",
        "Identifiant1day": "037a178e-20ec-4c9f-9f35-2cf28966b74f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_LT4",
        "VariableId": "c814c5d2-6fee-4faa-8eaa-ecae538c22d2",
        "Identifiant5Min": "708e0f21-f4ad-468d-92e5-6b339bee648e",
        "Identifiant1h": "21264788-87ca-4fce-8661-14fc8e7c90b2",
        "Identifiant4h": "804a0260-6f3c-48ca-a5b2-3927c9dbd079",
        "Identifiant8h": "239a265a-ff11-4ba9-bb27-ab1bf0fd3ee0",
        "Identifiant1day": "10588a89-f633-4360-9033-144fa79b1a70"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_LT4",
        "VariableId": "4daa40e8-81a9-4b77-a9e1-ba18691252b8",
        "Identifiant5Min": "15493a02-3293-4f0f-bc72-f331e63c1e2c",
        "Identifiant1h": "11a195c6-f344-4d77-9a49-7c2684edbda8",
        "Identifiant4h": "03e014fd-e288-4f46-91fc-13fb817de643",
        "Identifiant8h": "d76115b9-7f1a-40e5-9583-72b142e7c490",
        "Identifiant1day": "cc37ca4b-732d-4a92-85a7-ba6544e76031"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_LT2",
        "VariableId": "93e6eb97-799f-4ff4-b5e3-c2015aa3bdf0",
        "Identifiant5Min": "88423417-bbd8-4ccf-b55f-d2f08ec40f2c",
        "Identifiant1h": "0a744ab0-d812-45ab-a756-7b0c7a538877",
        "Identifiant4h": "3dfc0714-4bad-4cc2-8cf2-090b2c9c669a",
        "Identifiant8h": "10768159-3b35-4eb7-adbd-259cc555e8cb",
        "Identifiant1day": "9fab4e85-6281-4beb-a161-1c51b33870d5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_LT2",
        "VariableId": "626f772a-8a32-4ad3-bbac-a27546c8977a",
        "Identifiant5Min": "f329299d-3506-4693-8abf-15cd2b300489",
        "Identifiant1h": "8cd80ef0-6a18-4375-bf31-1c37ee68007d",
        "Identifiant4h": "560b92a0-dab3-4a02-bf5c-222a4cc61720",
        "Identifiant8h": "c97ae9a2-dd72-49c6-99c7-7174670cdabe",
        "Identifiant1day": "904a3970-f817-4415-a0a6-8634ff90bc5c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_LT2",
        "VariableId": "cbb278a6-49e5-4cb3-a99d-c7159886e6dd",
        "Identifiant5Min": "97e36b84-bdb4-4d8d-8b5c-9bb83c976d4d",
        "Identifiant1h": "12e8393a-842f-40e1-924b-737ef4fbd6cb",
        "Identifiant4h": "f79edc4e-1ac6-4172-bf16-27ec3d231488",
        "Identifiant8h": "5a05bc9a-f3b3-4cbf-8224-b08a49cd09c0",
        "Identifiant1day": "8bbcf8ab-1f59-41ce-a036-2a327b3654c8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_LT2",
        "VariableId": "1e00bdc5-ebb0-4a53-8667-f4b0ad9f096d",
        "Identifiant5Min": "dbd18389-c5c0-4eb2-b24b-2994d5b04dc4",
        "Identifiant1h": "5cb4702a-82f7-41f3-b7cf-29c7ecd83beb",
        "Identifiant4h": "973f18da-fad4-43cd-8bbc-f6f531f3f213",
        "Identifiant8h": "6c60f9f4-c2b4-451c-9a74-4b57599ca168",
        "Identifiant1day": "ea325220-b218-4cc6-b8a9-78446832453b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_LT2",
        "VariableId": "7c15fcc6-619f-4b61-9036-188b1e6c0361",
        "Identifiant5Min": "db8a3559-75cb-4112-8508-e59af782cacd",
        "Identifiant1h": "4910662b-8a0d-47aa-b8cc-1a7e4343adf0",
        "Identifiant4h": "97fc670a-c511-46ff-8b72-73886ce107c5",
        "Identifiant8h": "af193b01-2e83-43eb-8289-ba0c4ddd9aab",
        "Identifiant1day": "bec22a31-f390-4bd1-9a03-1d3f463d715e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_LT2",
        "VariableId": "6299210c-9064-4c4e-be25-e1848bdde177",
        "Identifiant5Min": "072b32b6-0273-421a-a17d-4fb357e31613",
        "Identifiant1h": "bd8424df-055c-4f12-915a-fab396d8b624",
        "Identifiant4h": "8aa094d7-6cda-4f29-9ab7-6d0a3ec6e4d4",
        "Identifiant8h": "639a0a6d-e407-4f6a-beeb-17eef8319f66",
        "Identifiant1day": "2ee66066-118a-4fa8-bc87-b1673212fbcb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_LT2",
        "VariableId": "924e7dcd-c3fe-48b2-bbe7-f7510cde617c",
        "Identifiant5Min": "e87c7174-06ab-49f5-9b39-954f776c9882",
        "Identifiant1h": "908afdb9-51e0-4afe-a22c-6c5aad7208f2",
        "Identifiant4h": "6a5a7dfc-abaf-485b-8f4c-95c2c8b2ead7",
        "Identifiant8h": "322108ba-c8b2-400b-965e-ef6c03af4d36",
        "Identifiant1day": "ac6740ee-b1b9-4357-a868-dfd3206987f2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_LT2",
        "VariableId": "ff0bab25-fb84-4605-9d27-79372609dbc5",
        "Identifiant5Min": "89ef84d7-b955-4fff-897d-b81d59ae055c",
        "Identifiant1h": "bfbb2f51-ce2c-4dab-866d-2427e24aa56b",
        "Identifiant4h": "1bcead45-7c15-4dba-9b43-5d1a214bbeb7",
        "Identifiant8h": "06eba88e-50ab-4b86-b511-ff9dfb0114e7",
        "Identifiant1day": "556d5597-c1f4-451b-adc8-45be5b542e06"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_NSA_ATL",
        "VariableId": "61577198-ebe2-4287-ad11-b4bde7d059e4",
        "Identifiant5Min": "1a4597c1-48af-4394-b559-3e2addb88180",
        "Identifiant1h": "77be4d9b-6192-4f70-8095-ec39d198bac4",
        "Identifiant4h": "a2e6ccee-cc84-45c9-816b-dc79e9578644",
        "Identifiant8h": "ac162569-1e57-40ac-a52d-4a70c82cfc2c",
        "Identifiant1day": "fcd98c0e-1acb-400b-9281-4a53383397ee"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_NSA_ATL",
        "VariableId": "68958b19-2cd0-4c97-8ebb-64f27c10a7b6",
        "Identifiant5Min": "e6dd7ee1-2737-48b4-9220-6434faf022d9",
        "Identifiant1h": "a1165e26-279a-439b-a36f-0e4e652a4654",
        "Identifiant4h": "b4969759-d574-4098-b0b0-10e955b810fa",
        "Identifiant8h": "5c345c9a-2070-43bb-8fe2-7d5cf0362d3c",
        "Identifiant1day": "9a80cbc9-bb89-4c79-bdb0-65aaf3a411b2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_NSA_ATL",
        "VariableId": "9bf299f7-a45c-4f7f-aa2b-4619330660f0",
        "Identifiant5Min": "05f5571a-05af-4115-ad8a-7c63a4a94f91",
        "Identifiant1h": "f3dc8e54-7cba-4111-813f-8be6af63d95d",
        "Identifiant4h": "163d38c3-2cc4-44eb-be5a-a6b86377e382",
        "Identifiant8h": "e89f778b-8fa5-4727-b165-19f50286c6c9",
        "Identifiant1day": "f25f18d2-ee25-4dc5-8ed6-8873b9c94542"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_NSA_ATL",
        "VariableId": "5517476d-006b-46c0-a6bd-f6340dfbe0d0",
        "Identifiant5Min": "be28bcb2-d580-4003-a5e7-77cfd42e7f58",
        "Identifiant1h": "5ee5fbc9-19d4-4696-b55b-0f7a8ac1dfed",
        "Identifiant4h": "311c55f3-ed46-45df-94c0-dc33e3de7afa",
        "Identifiant8h": "38fd9838-b3bd-4e2a-86b6-4563bff1a24e",
        "Identifiant1day": "0c49ca11-385c-41e4-8fb5-db8b8884c6f6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_NSA_ATL",
        "VariableId": "cb729d1d-1831-4842-a27e-05079f5188ce",
        "Identifiant5Min": "c93a654e-5b9b-40d3-ba74-7858f5be52f6",
        "Identifiant1h": "dd555e36-13d9-4f3e-8dc3-7729733cecda",
        "Identifiant4h": "47835af8-f500-4d2c-a310-0e0bfaf7d87b",
        "Identifiant8h": "aeb9105a-bb3a-4858-899c-0c9b364e2581",
        "Identifiant1day": "cbb12693-0c09-4440-8c82-b24fb502d776"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_NSA_ATL",
        "VariableId": "60d133ad-502e-41c8-b7a0-502e047a008d",
        "Identifiant5Min": "0ab41ca0-8572-4145-b018-9aa9cdcccd15",
        "Identifiant1h": "0798fa8f-7239-4ad1-bce6-d1247ea5e624",
        "Identifiant4h": "cf22124a-aa05-45b4-acaa-ec83f7459a63",
        "Identifiant8h": "c7b937f8-04bf-4aac-bc5b-4d2ad8930517",
        "Identifiant1day": "7587a1b2-b9cf-4b39-a377-ec38469d7880"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_NSA_ATL",
        "VariableId": "107e63d8-5d87-4ea2-b9eb-555c2023b017",
        "Identifiant5Min": "82ad82a4-1588-436d-8871-22ae28461593",
        "Identifiant1h": "8c6bc915-c865-4dc8-a19a-3fd1ca790109",
        "Identifiant4h": "e09dda71-c143-4630-9a4a-695925aa4e3d",
        "Identifiant8h": "53f06312-97b4-4de1-b3d4-eb3e935dc5f7",
        "Identifiant1day": "97c5fd05-14be-4552-ab70-d175d752bed9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_NSA_ATL",
        "VariableId": "9c207511-986f-4b4d-a742-32f2bdf145b1",
        "Identifiant5Min": "92140b93-f30f-4724-a828-1872d3f791e9",
        "Identifiant1h": "fce6e6c3-3197-4e9d-bbba-f04a0dfa84ee",
        "Identifiant4h": "f8e8059f-eeee-44eb-bddc-f28262226dad",
        "Identifiant8h": "804cb674-acff-4880-9e50-e74411130eb7",
        "Identifiant1day": "5187781b-f6dc-4a9f-89b2-4a0dd5656146"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_PRESSES",
        "VariableId": "9567c548-d7a6-4a8b-aa8b-232578deeb6c",
        "Identifiant5Min": "13c9235f-84bd-40e7-a5b9-1854c7509319",
        "Identifiant1h": "af162fc5-a95b-4e0c-bfc3-5a6fa9931645",
        "Identifiant4h": "c6b01393-3990-4ff7-9fc8-8ccf36186c45",
        "Identifiant8h": "00e1144d-04f6-4762-b983-8fef574e2768",
        "Identifiant1day": "4c937645-b6b0-4a4f-99fc-e6459403ee65"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_PRESSES",
        "VariableId": "8421329b-c9b1-48fd-a859-5fc1577b4d9a",
        "Identifiant5Min": "97dbbd11-faa1-4fc8-8a26-dc9cc1bbb591",
        "Identifiant1h": "a4438c29-cd36-4f5e-826b-e2d12cb96469",
        "Identifiant4h": "293aa83a-d22a-4bfe-85b5-2a3ce989d06e",
        "Identifiant8h": "4a0e1228-c6f8-455f-a809-78a134071d9a",
        "Identifiant1day": "2f5661a2-64a0-4ba7-9683-1af47ac3cd71"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_PRESSES",
        "VariableId": "b59e2acb-57d1-4c25-a018-70e080f31f45",
        "Identifiant5Min": "c15c588d-f77f-4ab9-831b-648f72aa9483",
        "Identifiant1h": "6c6ca07b-f7b3-45a6-80e7-dee7b48b0ba5",
        "Identifiant4h": "d52f48e7-4a2f-4e9e-b638-ab78af8e01ca",
        "Identifiant8h": "197a1c2a-c895-42aa-a7c2-665c225f57a9",
        "Identifiant1day": "d694619c-56d4-4bae-8b22-00bd4e15c344"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_PRESSES",
        "VariableId": "d47272c1-c976-459f-b7ff-e4c1c41b4131",
        "Identifiant5Min": "87fe7d5f-d0d5-450d-9f60-7cfdff8fac2e",
        "Identifiant1h": "d92b81f9-15d3-4a49-9074-ec4fa8f1bb9a",
        "Identifiant4h": "f8c010fe-d4a9-481c-a6b9-297f9f55883f",
        "Identifiant8h": "ffdfdf67-4e70-4743-a3f8-ae8f9c2163bc",
        "Identifiant1day": "c452ed22-a23c-4fa5-b57a-4b99dd2c5a22"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_PRESSES",
        "VariableId": "d572ba82-918c-4fae-84b0-4602c3e698e5",
        "Identifiant5Min": "09eaa624-f947-47e2-9117-5c89dbf0362e",
        "Identifiant1h": "79a8f7f3-04b8-440f-b016-7f5e3049a3b2",
        "Identifiant4h": "b4866be6-967e-4c82-8397-7af080697043",
        "Identifiant8h": "6b2a9d0c-e46d-4a1b-8e07-00bb8ae278d4",
        "Identifiant1day": "0496651c-65b4-4103-a1a4-8408870b0d76"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_PRESSES",
        "VariableId": "14f856e4-6a47-44fa-b709-34a38f1a88e6",
        "Identifiant5Min": "523fe7d4-a6df-43cc-b953-371dc4bcc3e8",
        "Identifiant1h": "73d1c375-d410-49eb-b18c-642752861725",
        "Identifiant4h": "a387aa35-a4f2-4cf2-bc9f-f9e5600f4081",
        "Identifiant8h": "663d9f70-df9a-4e26-a33a-d842f0596883",
        "Identifiant1day": "1a37038c-f9cc-4123-a59e-0f7f39b31849"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_PRESSES",
        "VariableId": "2fac11c8-9d18-432c-ba5e-c5e205aa6f59",
        "Identifiant5Min": "436a493b-da03-466f-8e2b-88245193e5ad",
        "Identifiant1h": "64d9a5d8-9871-4321-a552-ccaadece8cda",
        "Identifiant4h": "fd8f0c2f-3f3f-4563-a2b0-501aaaf1dad3",
        "Identifiant8h": "f17040dd-fe4d-478c-814c-7f6c12c6e5cc",
        "Identifiant1day": "0f05066b-0b67-4b96-9fce-20f556559c46"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_PRESSES",
        "VariableId": "b3d2a097-23db-4a9b-bdd5-93d06be5c3a3",
        "Identifiant5Min": "44bed10c-7433-4f6e-ab8e-af3047dfefa1",
        "Identifiant1h": "90e622ce-e7a6-42dc-84cf-de8aed9c457a",
        "Identifiant4h": "4c66b0d4-aceb-434d-a0e3-a62b68eee148",
        "Identifiant8h": "057eecb2-650c-4200-96a2-18874fc22c5e",
        "Identifiant1day": "29502101-c8eb-4f64-939a-4f737a6e8f71"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_TDE_ATL",
        "VariableId": "267c999e-4aef-4f09-9f87-4392bb4d4a87",
        "Identifiant5Min": "19a0e2de-ccfb-489a-a7d4-8dee42bd744c",
        "Identifiant1h": "8aa9499a-06ce-4a45-af61-256e3ab7e42f",
        "Identifiant4h": "3e8cb998-fc1d-43bb-b3ce-61bdc311e707",
        "Identifiant8h": "202b5502-d3ae-42ad-893f-c151e3f28555",
        "Identifiant1day": "445fd782-8c64-45f4-bb66-6676aca64a53"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_TDE_ATL",
        "VariableId": "d2e4a0f3-527f-4a5c-920e-e75d8372d585",
        "Identifiant5Min": "a1f7e2c7-cecc-4607-ad40-52fa7d5c6940",
        "Identifiant1h": "f9a566c8-5c4a-4a6e-b3de-2dda6cb37679",
        "Identifiant4h": "9c60327c-b60a-429a-ae10-76664b568d0a",
        "Identifiant8h": "76694235-bc53-4ff5-90f4-eddda0001858",
        "Identifiant1day": "eef3af4b-cfe9-41dc-940f-d6cca43aaec0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_TDE_ATL",
        "VariableId": "a4177a5b-a63a-4d0c-94c7-150a056b361e",
        "Identifiant5Min": "de3ea093-b41b-4ee7-b706-fcecd98dae66",
        "Identifiant1h": "7c192814-6aa5-4af0-aa28-ea6aafc25cc2",
        "Identifiant4h": "14c543ee-6ed4-4776-ba43-0a526b3636e5",
        "Identifiant8h": "65250c51-f47d-473a-bf99-0b6866b0724f",
        "Identifiant1day": "5418817a-deab-4d57-bd19-1734910ce684"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_TDE_ATL",
        "VariableId": "9c663c5d-9379-4f02-90fc-51b55c1c0bb2",
        "Identifiant5Min": "0a5505d7-7cba-4cfb-9e55-cc96ac530b75",
        "Identifiant1h": "7af9f888-3b68-437c-ba5c-4108a1319fff",
        "Identifiant4h": "4b52ee40-91b2-4f56-b580-f36b7c375201",
        "Identifiant8h": "088b56c4-e44b-41f3-b00f-b1aaa173c3b8",
        "Identifiant1day": "c68b2d9f-6fea-445d-8d2f-ab64435915e1"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_TDE_ATL",
        "VariableId": "ca19ee68-5721-4c44-b96c-6346302ec3e1",
        "Identifiant5Min": "caa8db12-d3e9-4c71-9541-302a484134b7",
        "Identifiant1h": "89004e19-9caa-4b99-a776-8026b538b018",
        "Identifiant4h": "23d92260-d6af-4a97-be9e-f3a89953cd28",
        "Identifiant8h": "1d088b13-561e-454f-a20b-dab82f6f08ca",
        "Identifiant1day": "4c1b2597-6386-4418-af17-db841e45aed5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_TDE_ATL",
        "VariableId": "794c0acf-2196-43c2-9fc9-61f2bafb3e2c",
        "Identifiant5Min": "942be919-8020-46ce-914b-5fb9cd8fbb10",
        "Identifiant1h": "b41b238b-9dd4-436b-a9e9-0cd067838a5a",
        "Identifiant4h": "1805db25-985a-43ab-9b11-b609d8ba35ae",
        "Identifiant8h": "bf59cb79-8cc3-4476-803e-f5702d95dc92",
        "Identifiant1day": "715a4bf4-f3b7-4ebf-81e5-0f75c2bc8d72"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_TDE_ATL",
        "VariableId": "d39812f7-1792-4006-86fd-61df2f8eeb58",
        "Identifiant5Min": "3bd9f2d1-3ba3-44a4-9be7-bac929cf9d98",
        "Identifiant1h": "9c5dfe39-81ec-4d25-bc6e-3fa38680c277",
        "Identifiant4h": "6eb84eed-0195-4d8d-b86f-ab63c46af63a",
        "Identifiant8h": "aeda89d6-3890-478c-8af8-139fb0287bcf",
        "Identifiant1day": "ff0737e3-8a53-402e-96b3-a5fcdf38dea9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_TDE_ATL",
        "VariableId": "e4c67058-3093-4a53-9c25-0ba39da19484",
        "Identifiant5Min": "aade9114-a32e-4e15-9e12-588c49355a91",
        "Identifiant1h": "c4efb79d-eb94-4e60-8936-0f4cfa2bcdb3",
        "Identifiant4h": "a2ff1966-8488-493c-b201-fe81a44ea5af",
        "Identifiant8h": "4eae4071-e47a-4cfb-9480-8ad766a4c050",
        "Identifiant1day": "cfad0e03-f869-4742-bcb8-f09878892839"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_EAU_REFRIGEREE",
        "VariableId": "6794ab26-b518-4f21-8e67-13daed36a8fa",
        "Identifiant5Min": "d5734ef3-6c23-4080-8d45-976cd051063b",
        "Identifiant1h": "7cb7b1ac-3620-407a-86b5-99ca7f789139",
        "Identifiant4h": "e9221a5a-a59d-4e66-b908-0f7327cb06a7",
        "Identifiant8h": "4849faa1-2960-418a-94e2-a72ef7e150ed",
        "Identifiant1day": "375b367e-b19d-49be-bb9c-9ca870813413"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_EAU_REFRIGEREE",
        "VariableId": "724aa992-87bb-4278-b420-e478f98e98b9",
        "Identifiant5Min": "2c93a206-ddfe-430a-af33-5e57e325defd",
        "Identifiant1h": "265cd52a-7489-4711-8ca1-6913b3f4b0c2",
        "Identifiant4h": "e021ad0f-a951-4307-bd27-dc98081ddbda",
        "Identifiant8h": "ca0cdadf-f3ee-470e-ae90-5348f787c06a",
        "Identifiant1day": "b816bcec-a384-4c9b-b6ee-e1461dfe3205"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_EAU_REFRIGEREE",
        "VariableId": "6baefac0-9e19-47a4-a464-76d667df523f",
        "Identifiant5Min": "776943c7-6710-4164-90e2-41048d5dec62",
        "Identifiant1h": "bfc54b20-a11c-482a-9ec1-2e360ed54705",
        "Identifiant4h": "fe9692ae-9aeb-4d1b-93ed-ecc83c6da79e",
        "Identifiant8h": "a52443fd-5811-47ff-bf2f-e2324e2285e7",
        "Identifiant1day": "e983b307-1a40-4310-bc1b-857761539aa2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_EAU_REFRIGEREE",
        "VariableId": "50422c3b-9af8-4067-b301-6d2d8f7cf428",
        "Identifiant5Min": "1ebaaf1e-aa8b-457c-a6bb-a60f1ddd8ecd",
        "Identifiant1h": "b456f89d-d8e6-42f1-94ad-00c66159b6df",
        "Identifiant4h": "bd99158d-f089-4cc5-bf80-3c6d98096166",
        "Identifiant8h": "65b3a9a3-b035-443c-a1cc-1512b6229287",
        "Identifiant1day": "3fd68242-458e-4809-9236-4659b58a3816"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_EAU_REFRIGEREE",
        "VariableId": "9c1700b7-7026-42f9-a1d0-07c43c472695",
        "Identifiant5Min": "cf13fb1b-d570-4cb1-a4b6-ad475cf790c7",
        "Identifiant1h": "78bdf231-c2ba-422a-aac8-aabfcbd08002",
        "Identifiant4h": "8210e88f-26bd-4e39-8f37-01537c579ebd",
        "Identifiant8h": "9bd7bbce-718c-4bab-aa76-92662a3e0055",
        "Identifiant1day": "6ac7567c-6fc8-4829-9051-bb410d7357d5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_EAU_REFRIGEREE",
        "VariableId": "206c094f-f487-4508-bb2a-28eb331724c2",
        "Identifiant5Min": "5cafa600-cdd2-452e-a2f1-a76089b1e13a",
        "Identifiant1h": "2f1a2fa1-a900-4b6e-8f78-d7876de8dac1",
        "Identifiant4h": "7546c49e-0e6d-485d-a22d-b2b81c8e0214",
        "Identifiant8h": "c6211027-58b5-4a99-b485-ed1b2a7c4764",
        "Identifiant1day": "5135e178-056a-47c3-9106-1d0378a67638"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_EAU_REFRIGEREE",
        "VariableId": "84eb7a92-7619-4639-b93d-05f49aa94243",
        "Identifiant5Min": "313983b6-cf89-4677-8928-f0e986bea7d1",
        "Identifiant1h": "7b20832e-765b-4d15-a7c7-fb8a09698d7f",
        "Identifiant4h": "ebdb6dfc-e04a-4ba6-a817-c5a5917d51e0",
        "Identifiant8h": "3f00444e-a0a2-4321-92fb-c10445a52ef9",
        "Identifiant1day": "b85329cf-04c0-4da9-a746-1d238fcb7ec7"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_EAU_REFRIGEREE",
        "VariableId": "c91f00a8-e66c-427f-9d53-45346ae5edeb",
        "Identifiant5Min": "05ea103c-e326-45a7-b6f6-3f10eef9e284",
        "Identifiant1h": "4b470766-a9ef-45f5-93a0-ffb18f8087f8",
        "Identifiant4h": "1564f3b2-801d-4400-a648-dc4bed49a442",
        "Identifiant8h": "04085c65-b1fb-43a9-b816-42cdfc944cd3",
        "Identifiant1day": "e53b8c82-ce12-43a4-8ae5-b0d326bbb1a2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_LOGISTIQUE",
        "VariableId": "f2bb1fb5-78a3-41b8-b28e-2e14c76ed324",
        "Identifiant5Min": "8e81cd11-e907-43aa-a5bc-05d629a39d6f",
        "Identifiant1h": "4d4f1dc1-74f4-4525-8fa5-4fc6a8be9680",
        "Identifiant4h": "7394ff66-01c6-4e79-9974-9745d36eb0c7",
        "Identifiant8h": "06468361-ae4a-4ebd-87d1-759dfa995158",
        "Identifiant1day": "87e5fbdc-2506-40eb-89fe-b36cea7fc414"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_LOGISTIQUE",
        "VariableId": "eabb2247-71f4-4e92-a535-cd9f1f97388c",
        "Identifiant5Min": "004edd05-9291-420d-8043-a009419ce09f",
        "Identifiant1h": "4dd2f62b-b73f-4fdc-aff7-3223ef3173cc",
        "Identifiant4h": "d9913529-a86f-467a-b94f-e58d59cc9162",
        "Identifiant8h": "06abd95c-514a-49ca-98a1-1c646bd2db53",
        "Identifiant1day": "a0ca8c87-eaff-4100-8882-3cc826c63bbd"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_LOGISTIQUE",
        "VariableId": "373cb27e-ebb4-4734-b4df-fe05b3d87a63",
        "Identifiant5Min": "a93d5522-6922-4dbc-81c5-d738717150dd",
        "Identifiant1h": "145985a1-e26e-4007-853c-dc5a3cba83e9",
        "Identifiant4h": "c602db2a-da25-4cd8-b6b1-ca013c62a7a9",
        "Identifiant8h": "c600f642-5324-46d5-8f07-8dbd66e8c171",
        "Identifiant1day": "df11cdcd-a897-49c4-bd90-1240c79bc404"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_LOGISTIQUE",
        "VariableId": "52b01a06-9e1b-45d7-bdc6-3b5214f4e293",
        "Identifiant5Min": "9cc0c648-adef-4bf1-ac04-d428646caada",
        "Identifiant1h": "800bb604-5d2d-4195-8b85-961e1bf92379",
        "Identifiant4h": "e919c62d-560a-45cf-943f-b2255162d851",
        "Identifiant8h": "6c7993c7-4c70-46bb-b366-8ec336ec1465",
        "Identifiant1day": "33f57f20-9a67-436d-afe2-12df8ddd19b2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_LOGISTIQUE",
        "VariableId": "6ea7dcd2-53eb-4bde-8f58-cad19da2df0d",
        "Identifiant5Min": "187a6137-c4ca-428e-87b9-5292b98e80fa",
        "Identifiant1h": "d5e040df-1be6-4086-a072-fd55b13bc5cc",
        "Identifiant4h": "e7efb938-86c4-4ece-bd16-9cc9c8c95c27",
        "Identifiant8h": "45d0b289-57e3-4e4a-8615-7f29a13a69ff",
        "Identifiant1day": "ff95eadc-222e-4cbe-be62-4b0aa1b9f8a7"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_LOGISTIQUE",
        "VariableId": "dc0fcbbc-86bb-46b3-8eef-45ce0b0b8ff8",
        "Identifiant5Min": "75a979f6-50ca-4fef-bf04-a4130167337d",
        "Identifiant1h": "8651ece8-f469-44f9-9999-22e8cc78461a",
        "Identifiant4h": "e9576aca-e4fe-4cd2-8aa1-d3891872987a",
        "Identifiant8h": "1f6c7ef5-9ddc-43be-98a6-80a7461d7fb1",
        "Identifiant1day": "3ad0b27f-fae8-4e5d-9637-0cd7df6c3c1b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_LOGISTIQUE",
        "VariableId": "570ffbf8-389a-4c4a-982c-afb55b5fa86c",
        "Identifiant5Min": "0924a2d1-de40-4c7d-8493-8487bf48c1c1",
        "Identifiant1h": "e4dd8906-badb-49a7-9242-d2475bccf6e8",
        "Identifiant4h": "a153995f-6747-4cad-a72e-9a7bb1878125",
        "Identifiant8h": "719bd66c-43f6-4fdb-b57f-6a5d373e83f6",
        "Identifiant1day": "9edeeaa1-12e4-426f-b967-ad5ec3152156"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_LOGISTIQUE",
        "VariableId": "f825b66f-d4fc-47e3-a1eb-6de82ad7caa2",
        "Identifiant5Min": "492e01ff-fa06-45e2-a55d-3c386d43c458",
        "Identifiant1h": "d42447d2-026e-4d21-ae49-fd004dfa72f6",
        "Identifiant4h": "fd5aa903-3790-4486-8ec4-40f58d10331a",
        "Identifiant8h": "e52a761d-03b2-4017-a4d0-bd05ca9b26d2",
        "Identifiant1day": "c88d560b-f92d-4acf-a5f7-fe12696950a8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_USINAGE_ATL",
        "VariableId": "538087f9-9b53-49d2-903d-2a8f0ab5f3d0",
        "Identifiant5Min": "9475f170-c4e5-4dd5-a09d-feb49734f769",
        "Identifiant1h": "e410d741-44f4-4e3d-95e0-2a1b1a535f5d",
        "Identifiant4h": "601cb361-2574-42f1-bce5-535eb2f06985",
        "Identifiant8h": "35194218-59fc-4944-8048-57920e25a0bd",
        "Identifiant1day": "832ad63a-9248-45e3-9472-58175e1e9417"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_USINAGE_ATL",
        "VariableId": "b6fec776-26ab-4905-afec-16646f24c10d",
        "Identifiant5Min": "3a3fc536-f41d-469a-b07e-44b1d0668301",
        "Identifiant1h": "df7c8f93-e256-4dcc-a481-098abfb6684f",
        "Identifiant4h": "e560916b-517c-4382-a0b2-fe0890024ff5",
        "Identifiant8h": "e26b0d0a-e0f4-406d-a7d9-bfb026fab004",
        "Identifiant1day": "544c8b7c-1f4a-4cab-9709-77bcd8591253"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_USINAGE_ATL",
        "VariableId": "e640af6c-97b5-49c4-bd7f-53d0362385f2",
        "Identifiant5Min": "62432b3c-964a-402e-9b09-6783dc5e2cca",
        "Identifiant1h": "e9d89204-bcf8-4738-bd53-b0bcc7dc295b",
        "Identifiant4h": "357fbca8-2316-45b9-aa96-e1e58dac8acd",
        "Identifiant8h": "ff2ed920-bbcc-4c3a-a211-2570b1dfe548",
        "Identifiant1day": "2991499f-85e6-4d49-972f-0e2794b5d855"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_USINAGE_ATL",
        "VariableId": "9457b2a8-938e-4543-841f-c7cb53f0820a",
        "Identifiant5Min": "bdad39e5-1f48-4373-8fdc-7f44925bd31a",
        "Identifiant1h": "00ae0e11-cb81-4ee2-9d20-9c7f9639ad64",
        "Identifiant4h": "5dc2bd81-53d3-4f92-ad80-268b6c8c17d3",
        "Identifiant8h": "8da8c8e0-aa4a-4691-a2ec-f98afc3684f4",
        "Identifiant1day": "262948dd-15a0-4b6b-bb25-c762d2816791"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_USINAGE_ATL",
        "VariableId": "f2bd2464-fb86-4d90-b8b5-44489bfe9441",
        "Identifiant5Min": "39bd91da-75ac-468b-b6f2-fc200640a8ff",
        "Identifiant1h": "e9145bde-b902-4b4e-adee-525334deb11c",
        "Identifiant4h": "3a680dc3-c83b-44b6-a615-aca3957923fc",
        "Identifiant8h": "17ad1972-878f-4ff9-b0f9-7e5af7105cd5",
        "Identifiant1day": "f999f499-875b-4394-ae74-da761aa1b2db"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_USINAGE_ATL",
        "VariableId": "29be4079-36bb-4d12-a35c-39b8cd367b9d",
        "Identifiant5Min": "c4f6bb56-4560-4241-a70e-48ecaac5760a",
        "Identifiant1h": "d1982ab9-23a9-4e2d-86ee-8c94d80534a0",
        "Identifiant4h": "fffb2978-ead3-4dcc-a226-9ec43d90f39f",
        "Identifiant8h": "c626e85e-b707-4c82-8d86-0d3ac58c4543",
        "Identifiant1day": "b02e8335-baa1-4472-993e-3831ca37e8d5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_USINAGE_ATL",
        "VariableId": "5c5ac248-40e0-441f-a4bb-4a519c4d6ddb",
        "Identifiant5Min": "ee868838-6e63-4d31-8159-ef53e16cf526",
        "Identifiant1h": "cca7f9a5-9339-48bf-a6e6-e1d697fb6509",
        "Identifiant4h": "bd1f457f-93de-421e-9a0f-4a621dcb1f50",
        "Identifiant8h": "616cddf2-d01b-4c02-b6e6-582fbc0502ec",
        "Identifiant1day": "c375e3bb-e043-4922-a036-85aeadf9d867"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_USINAGE_ATL",
        "VariableId": "2fed331c-acda-4c60-9b8e-604f26883af1",
        "Identifiant5Min": "e7d529cc-88c0-4ada-bc2d-3977c7bc4f1a",
        "Identifiant1h": "5220b169-ccb3-4e8c-b758-342f4d3fce1e",
        "Identifiant4h": "9e543460-a2d0-4fb9-ac54-ef9d56f8bca3",
        "Identifiant8h": "c1b57845-8e35-446b-a516-7559a01d8aca",
        "Identifiant1day": "f7721952-a3f5-4d3b-bd82-893c01a43fcb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_CTE_ATL",
        "VariableId": "3d3aeb39-aaa3-45ca-9ccf-3e4179d110fc",
        "Identifiant5Min": "bbe6fe54-a00c-411d-b568-e05c5c7dd5c2",
        "Identifiant1h": "4529340f-d606-4bb6-aed7-3a8162bd6a73",
        "Identifiant4h": "b363cbd9-5231-48ca-b41b-d28aa2800883",
        "Identifiant8h": "9360207c-3d88-40f7-960e-b634e4e9aa1f",
        "Identifiant1day": "98fe7a28-abd5-41d8-aa73-78e24832e4e2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_CTE_ATL",
        "VariableId": "f3e1d5db-e781-4898-86f0-c863b97f0471",
        "Identifiant5Min": "82a7b236-318d-44ab-9bbe-0bbe9f965462",
        "Identifiant1h": "4c5bc4d1-8a77-4a2f-bb0a-591a3b4bf398",
        "Identifiant4h": "17510895-927c-48c9-81c8-b729a75a9793",
        "Identifiant8h": "fe39cf81-f79b-4007-901c-427b1d1ec42e",
        "Identifiant1day": "bc9c04bd-2666-433f-bb49-538f0aa48050"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_CTE_ATL",
        "VariableId": "64436c15-f909-48f5-ad9f-94c62afb7d20",
        "Identifiant5Min": "5f0463c8-a305-42ac-ab08-d3c47119de3b",
        "Identifiant1h": "b989e4cc-5fa2-439c-a327-9eae70a786c6",
        "Identifiant4h": "42df41e3-b295-46e1-9901-93821c5eb1a7",
        "Identifiant8h": "a4b0aaf3-50b9-4de1-acaa-753fb81dd4f7",
        "Identifiant1day": "d9f06942-7865-46cc-9842-cb5bcb931612"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_CTE_ATL",
        "VariableId": "1fe74797-84aa-408a-859c-269923bda70b",
        "Identifiant5Min": "b8410fab-5dc1-4940-985c-b7d49be6bd8c",
        "Identifiant1h": "ec48c38d-b466-40dc-9aae-e4bb472ac6c9",
        "Identifiant4h": "cc834fb6-2574-405c-bde9-056c03dfca74",
        "Identifiant8h": "c6fbbf15-3357-47f5-9cf0-7bc4cbaf3a73",
        "Identifiant1day": "5c121645-d21c-4557-ac49-9ad915eab91a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_CTE_ATL",
        "VariableId": "bcd0f891-3fa6-4881-bc56-a93f0259a58b",
        "Identifiant5Min": "5ebc56e8-be10-491e-a27a-f4065d9431c4",
        "Identifiant1h": "cb86dfcd-0d2d-4447-8aa1-055e6faa4856",
        "Identifiant4h": "1a0d804e-acb9-481e-9a72-d79a3b0a993b",
        "Identifiant8h": "c12dbf48-259a-4ad7-9e85-fae7e94d17db",
        "Identifiant1day": "2d36c090-2144-4541-a469-bd6426178217"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_CTE_ATL",
        "VariableId": "b650d92c-5b2d-4686-9615-699283b92f0f",
        "Identifiant5Min": "a15c6871-923e-499d-8b4d-dc725e8fd852",
        "Identifiant1h": "1882dcb1-ba2c-409d-b153-6fe0becc26e6",
        "Identifiant4h": "292edfa4-ca2b-407f-adf0-38c9c90a8c2f",
        "Identifiant8h": "d7f027a4-413e-4129-af23-16330ddb99e2",
        "Identifiant1day": "e913ba63-79aa-4f59-b973-4eb8ab8b64d9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_CTE_ATL",
        "VariableId": "784d03ac-56d4-44af-8a32-c96a396ed07f",
        "Identifiant5Min": "06a1ffb3-7cdd-4b2c-a28d-393fb4f4d1d1",
        "Identifiant1h": "4dbe3100-c03f-4337-9504-edd919e474ea",
        "Identifiant4h": "b5fa06b3-3775-4c65-8719-9c1a293ebd8e",
        "Identifiant8h": "428476d6-c150-46d9-93aa-9be50b5eff09",
        "Identifiant1day": "f82d3bfe-40f5-402f-ae3c-6ec83c5cf0a3"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_CTE_ATL",
        "VariableId": "2eac7f9b-c227-438a-8e1c-5c5520128edd",
        "Identifiant5Min": "5e1543b4-af58-4578-aca8-cab810a9215d",
        "Identifiant1h": "e8eb3637-bc38-4b46-b783-597468770c29",
        "Identifiant4h": "315b745f-3ab1-4642-9123-d73e8ba3f3f1",
        "Identifiant8h": "9d5a0e5f-5087-400f-87e0-1a92f9e7ba6d",
        "Identifiant1day": "38da73ba-9c41-4e9d-b888-c0527325a9bf"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_REFENDAGE",
        "VariableId": "f89b7e55-e3cc-4fc1-9a58-b1ca5d6cd774",
        "Identifiant5Min": "65708bd2-cf93-467c-8791-6cefec07d0c9",
        "Identifiant1h": "48df2235-81de-4743-afa9-d1cf1f9a3f2e",
        "Identifiant4h": "361341c8-167e-42ba-9db4-b76f9759e666",
        "Identifiant8h": "5c1d9bb3-6107-47d0-8002-e7504b48d39e",
        "Identifiant1day": "7f5d4f0c-5383-4c85-89a0-8e35c6a2aa6a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_REFENDAGE",
        "VariableId": "1133f444-4a41-4f72-b32a-1426c5b2d35e",
        "Identifiant5Min": "110c6b44-bc47-4e30-b9fb-3caf3d771d38",
        "Identifiant1h": "547d8e1c-05d5-4d6c-8ad3-8b7b4b024855",
        "Identifiant4h": "8bc34cea-f266-4eb9-8b24-c12f4a91b91b",
        "Identifiant8h": "e2cfdfef-5e80-48dc-a8aa-097ba261b16d",
        "Identifiant1day": "4b88da66-3df7-42b8-9fc6-b88315a7072d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_REFENDAGE",
        "VariableId": "0648f759-4ab8-4248-b7d5-0b6e9527ece3",
        "Identifiant5Min": "627c5d86-43d2-4262-940d-bfda794a85be",
        "Identifiant1h": "a49c87da-f553-465a-91e8-d103a168e99d",
        "Identifiant4h": "46bf1823-2e45-4201-9002-eb2cf0fd0670",
        "Identifiant8h": "30df492b-6dfa-4fe5-b9aa-fdd7d0d69721",
        "Identifiant1day": "89b79e44-c9f5-4b7f-a07b-a9048d168bd9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_REFENDAGE",
        "VariableId": "18b99a68-db47-479c-b095-740415143ca0",
        "Identifiant5Min": "078875f9-a228-4b9c-b757-756426e6583c",
        "Identifiant1h": "17306b60-d016-4295-b604-34d380b3a9e5",
        "Identifiant4h": "6809f144-5bab-44c9-8978-8c966b80d1cc",
        "Identifiant8h": "ee0752e8-55a0-4c3a-a14b-28d64378d7e4",
        "Identifiant1day": "fe0b56df-353c-47d9-a0a9-918c85e34c64"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_REFENDAGE",
        "VariableId": "f785c186-9f72-4e9e-a953-ebea4e99fe19",
        "Identifiant5Min": "802e214b-7810-4c78-8076-b23861a84a9d",
        "Identifiant1h": "64cba01f-9d9b-4d27-b06c-f16d4b7998fd",
        "Identifiant4h": "a78537a2-0dd2-408c-b180-6ad8b04423a6",
        "Identifiant8h": "31420ab3-2729-4570-958d-2b1502ba92cc",
        "Identifiant1day": "5c024037-2c06-4852-8b85-be682374727e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_REFENDAGE",
        "VariableId": "059b9fc1-0882-4a06-a36d-75ae35871553",
        "Identifiant5Min": "737b8668-cca7-4c78-87d1-d9c39660a6f3",
        "Identifiant1h": "fb0acb8f-e40e-47b4-bcce-08ef8c713cd0",
        "Identifiant4h": "63d0f4e1-fe0e-458d-835e-7214689eac2b",
        "Identifiant8h": "5bb6722c-7af0-4f03-b202-fa26e1360733",
        "Identifiant1day": "5703e259-7185-43fb-9b2d-a3d45f78466f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_REFENDAGE",
        "VariableId": "c8b661da-3235-464a-92b6-e3c78a0b0969",
        "Identifiant5Min": "38733ab4-bd1d-466c-bca9-0355adc988f1",
        "Identifiant1h": "511d94e1-c107-4486-8737-18ad52226b01",
        "Identifiant4h": "66e8970f-a2f6-443a-976b-6f220287f4bf",
        "Identifiant8h": "e44b5d86-78fb-460e-9a21-2da87adfe824",
        "Identifiant1day": "aa159392-1d42-4fbd-9919-abecd95164dd"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_REFENDAGE",
        "VariableId": "ae425170-dac7-483b-b2f6-44a748c40f78",
        "Identifiant5Min": "85e6cf1b-fa89-46db-b9f6-ac32e2bccdf2",
        "Identifiant1h": "622d1a34-a27f-4952-8722-83633cfdd78d",
        "Identifiant4h": "b2a6a95d-0f80-484f-bc49-db0f9e9deefb",
        "Identifiant8h": "082bcf29-54a2-45a7-9b6d-7ca33c9ec89c",
        "Identifiant1day": "aafeee94-8d72-4717-b5e4-de6e13b0c4fa"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_PUITS_1",
        "VariableId": "771667d2-e0ed-414b-ae35-01ff1b29076a",
        "Identifiant5Min": "88293307-3e67-4b1e-8dad-1fd38e000451",
        "Identifiant1h": "36424438-6431-47e7-9bef-359992552169",
        "Identifiant4h": "af41e81c-680c-4387-90c4-f7e7708d6a72",
        "Identifiant8h": "d006aa7d-f43b-48af-b260-43a5ba944892",
        "Identifiant1day": "3d66813a-548d-4398-8487-a47681f9ec51"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_PUITS_1",
        "VariableId": "9943b8aa-9cd2-4c9c-997e-67cfa5d49ba7",
        "Identifiant5Min": "163e31cb-e609-4a11-9c1c-fbf863787c76",
        "Identifiant1h": "a871b8d9-26cc-4fa3-8612-35024f838fdb",
        "Identifiant4h": "0176c0f9-9405-4e4c-9c9e-37141ab77162",
        "Identifiant8h": "fd9739f8-af25-43e1-90d8-929e7034a617",
        "Identifiant1day": "cd463dd2-1f8e-4140-b33b-fba9a94456c9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_PUITS_1",
        "VariableId": "9b646d46-43d5-4fdc-97cb-2530d06aacc4",
        "Identifiant5Min": "56de3c81-1f8e-4fd7-9fe5-6b51a2792de2",
        "Identifiant1h": "a4ecc3eb-3181-4789-844b-d1e3674778c8",
        "Identifiant4h": "9b002da4-6b82-4e2d-8b1b-7b03a723ff5a",
        "Identifiant8h": "9299a80b-b773-4d3c-b122-ab11a2bf39cd",
        "Identifiant1day": "de3afc87-6ea6-4ad7-9fa0-065238c7068c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_PUITS_1",
        "VariableId": "e55df291-df68-46bb-9620-e39ca8e6c890",
        "Identifiant5Min": "6c2f2ec5-f58e-4968-8f50-098c48e39ff6",
        "Identifiant1h": "9158e309-9263-4d7f-9c19-ad9ac4233764",
        "Identifiant4h": "1273ecc7-03c9-412a-ae4d-16d9628daef5",
        "Identifiant8h": "315d3dd1-099e-4b5d-9445-3b8aa590d00d",
        "Identifiant1day": "6377c456-fc38-46ea-9163-7dbdc07506c2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_PUITS_1",
        "VariableId": "4eecaf51-e4ec-4529-aa48-3058d1ec1eae",
        "Identifiant5Min": "da215884-59d4-4e57-bc42-df6496bcbc4b",
        "Identifiant1h": "fae7edc2-389a-4f0f-be6d-3bab2fbca69a",
        "Identifiant4h": "e0245eed-838a-49c4-9e65-1f51cbe5a2e9",
        "Identifiant8h": "71791f5c-1f9a-479e-a49d-3c634af6fd44",
        "Identifiant1day": "f35f6a21-74d9-4453-b3d0-91f7363cef6e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_PUITS_1",
        "VariableId": "0b7bc2b5-115f-4a45-b66a-1377ee600bac",
        "Identifiant5Min": "d10f4b5a-32a2-41fb-b213-85dc56f660f1",
        "Identifiant1h": "53c91d8a-afae-4db1-bc5a-0b8024d1a90c",
        "Identifiant4h": "788a8c9f-202c-4b5d-a2d3-a9128c4aaea4",
        "Identifiant8h": "ca40d732-7fc1-4dfa-bdab-c96f1ae462f7",
        "Identifiant1day": "f06083c6-eff8-4bbf-9ec3-36c036dee1b3"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_PUITS_1",
        "VariableId": "3eccd6b2-af4f-471e-87a5-17b4de48bea9",
        "Identifiant5Min": "7510d9ca-be1e-4c2d-9c88-a3472d9ff117",
        "Identifiant1h": "9ee61c92-989c-4299-a6c8-075be9ff8b7f",
        "Identifiant4h": "cd9764c6-1f34-4e8f-8267-08fa39268757",
        "Identifiant8h": "b799fcb2-c913-4a73-9312-9e2fbc3bfe92",
        "Identifiant1day": "070e742a-83f9-4a9f-a6ff-320ca4b7e3e5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_PUITS_1",
        "VariableId": "b6588cbf-5169-40dc-90d2-23f3202dbe81",
        "Identifiant5Min": "d41bac39-fd6f-47b6-b27f-ca6fb06fc738",
        "Identifiant1h": "d239e713-0371-484c-98c9-bdc544959599",
        "Identifiant4h": "935fc44b-af10-4b0c-8cfb-c34e3f0231fa",
        "Identifiant8h": "4c8ea56c-a032-4b5c-933e-d4f69bf9cc79",
        "Identifiant1day": "f9a71686-7342-4d55-bb15-5e7f6212676d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_CHAUFFERIE",
        "VariableId": "fd276428-ef67-41cf-bb34-d099b87f82c4",
        "Identifiant5Min": "52fb6906-5911-4b34-9f00-233de13c2d30",
        "Identifiant1h": "f3daa045-47d3-4849-9278-0866c868622b",
        "Identifiant4h": "6548eedc-f41c-4116-b471-82b8a4e14149",
        "Identifiant8h": "b7c961d1-4503-4982-86b0-f8acf77d9ab6",
        "Identifiant1day": "2d422b7d-b99f-4472-b058-438fbecef6e8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_CHAUFFERIE",
        "VariableId": "28a0231c-87a7-452e-b420-d201324a3ed1",
        "Identifiant5Min": "675aa092-453d-4435-96fb-5b79810e864e",
        "Identifiant1h": "80bb0b84-0804-4566-91f5-c6a99998db50",
        "Identifiant4h": "2f3eaaff-9bf7-488d-9d87-d55de018eba9",
        "Identifiant8h": "690e7c95-5f73-4cf2-b521-6132b1147ebf",
        "Identifiant1day": "69d81ab0-22b0-4e8a-9576-bdee7202f183"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_CHAUFFERIE",
        "VariableId": "168f0c1e-dbd1-4ce9-9615-704100ac8fc3",
        "Identifiant5Min": "13547a6e-bc11-45f7-8c52-0475e5a2b166",
        "Identifiant1h": "536a06fe-910d-4768-b4b8-d4b318ca66f0",
        "Identifiant4h": "2affde2d-71a7-4c90-9819-79e4b45a1be1",
        "Identifiant8h": "9934c9c7-79c0-4e82-9ef1-995ccb331e10",
        "Identifiant1day": "2cdd7407-2a2c-44be-8db5-2dd62149cacf"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_CHAUFFERIE",
        "VariableId": "b2b7aed6-449f-429b-ac91-93fcf8559d1c",
        "Identifiant5Min": "75e289eb-e2ac-407f-a16e-8093c1cf579f",
        "Identifiant1h": "8e9e7faf-e0f7-4c92-ae02-22b1930fa64c",
        "Identifiant4h": "99c2fd64-9edb-4bf4-b354-eb225151d36f",
        "Identifiant8h": "2bca82bf-bf2f-460a-91e2-91134bba8290",
        "Identifiant1day": "e6d45c37-d73e-4ff0-a66c-ba16392d91a4"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_CHAUFFERIE",
        "VariableId": "d97fed73-2d2d-4da7-93de-ed88c174e003",
        "Identifiant5Min": "d690aa40-cf03-490d-b6ec-5307e2729e90",
        "Identifiant1h": "c1e5dd80-29a0-4576-b930-c60f80f5c373",
        "Identifiant4h": "d6a58fbc-849c-4c94-bf80-db6c65a2f61b",
        "Identifiant8h": "aedb479e-ca8a-43fd-8bcd-1bf5aeb8ab7a",
        "Identifiant1day": "d8dfbbc7-f158-409d-8b5d-0715e564f37c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_CHAUFFERIE",
        "VariableId": "e9e4e630-84c7-4af7-9dec-1a2935bf57e1",
        "Identifiant5Min": "17279c90-24c2-44a0-a0c5-d923962ea14f",
        "Identifiant1h": "da77e430-0b0a-4ce3-b5ad-6feb663f2f6e",
        "Identifiant4h": "d3a990a2-97e0-41b4-89d9-55be77290849",
        "Identifiant8h": "4f5a461d-ee60-4eab-b97f-acdab552e9f8",
        "Identifiant1day": "e90ad2ed-0f1e-4f80-8ded-3a1bd577671e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_CHAUFFERIE",
        "VariableId": "aa1a80d2-a2c9-4cb4-986a-9c45ccae95d5",
        "Identifiant5Min": "963e268f-e0d8-4e30-a336-46ada94ea4c9",
        "Identifiant1h": "83d086b4-dcfb-47e2-bb5f-b3f7c1e4e10c",
        "Identifiant4h": "80c428ce-9b2d-4877-945a-3f7ecf07a722",
        "Identifiant8h": "126b833e-2202-49b8-9d8b-6d3778727d5d",
        "Identifiant1day": "38966f23-16bb-4007-9a3c-cccbeda7900c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_CHAUFFERIE",
        "VariableId": "bbdb6f10-f165-4732-bd47-cbd1874fc7d0",
        "Identifiant5Min": "27d67ed9-d418-434e-aaa8-09401f293a1d",
        "Identifiant1h": "11018411-0c63-4c62-ac52-13dc6a00b34f",
        "Identifiant4h": "181b476a-518f-4ced-9cd4-cc3eaca07760",
        "Identifiant8h": "2a3bbfd3-4ddf-4577-9869-cb9162d1fb2d",
        "Identifiant1day": "fab85b38-936b-46b6-855c-38a5e7b999e4"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_PUITS_3",
        "VariableId": "80172635-7978-4516-b8e9-bdff4bfe14c8",
        "Identifiant5Min": "aabaa89a-69b7-429f-bf96-e6cbad9be563",
        "Identifiant1h": "b5fbaa9b-a880-4107-a754-c41ed5dae3f8",
        "Identifiant4h": "99d003ea-c8a7-478b-9dd6-6b680aee6737",
        "Identifiant8h": "02afb0d0-262c-49ca-b6bd-667a27d6c186",
        "Identifiant1day": "d268821b-669c-40d6-af8a-16e2d41826e4"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_PUITS_3",
        "VariableId": "03d3fa7e-1c0c-4ce6-98d9-89e4444ee9e5",
        "Identifiant5Min": "e60d6223-1673-417c-bf34-26e4aec477d7",
        "Identifiant1h": "c717d650-0a07-4233-83b4-bef049214c85",
        "Identifiant4h": "057ed791-7ca1-42b9-8913-da79d2453eb5",
        "Identifiant8h": "e7503567-6df2-4d64-8c01-164a869d4f90",
        "Identifiant1day": "30cab42a-0183-462e-a666-828aef0e3248"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_PUITS_3",
        "VariableId": "89767525-3113-41bb-b689-958a0eeb1d8a",
        "Identifiant5Min": "870d1496-2119-4393-9e93-c96cfd661494",
        "Identifiant1h": "3e721f73-5c2d-4dd1-92b4-7e80c7acd880",
        "Identifiant4h": "a6509ee9-c3a0-4fcd-9e0e-07796198b9f3",
        "Identifiant8h": "c18c5c77-3f2a-48ef-ba6f-f88d51718047",
        "Identifiant1day": "2e3c2d94-caef-4191-aafe-969bba7631de"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_PUITS_3",
        "VariableId": "03b5ba38-a465-45e0-a02a-399ef518f743",
        "Identifiant5Min": "388b4b9a-05da-4841-b845-7349a6f637ea",
        "Identifiant1h": "ab50f60a-6cec-4c54-8519-2f2dbecffdcc",
        "Identifiant4h": "33649839-1fe1-40d5-97a5-463c13581ed4",
        "Identifiant8h": "e20a7665-1e92-4584-a3e8-2b324ded099b",
        "Identifiant1day": "74bdd370-4a4d-4686-9ca5-ebf55823a10a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_PUITS_3",
        "VariableId": "38cbd456-9b56-4442-afbd-7a9e3dd98c78",
        "Identifiant5Min": "9cb54d0e-2c3e-4672-a600-45813607f352",
        "Identifiant1h": "c26e8c00-7217-4639-845e-92ef830c2c83",
        "Identifiant4h": "a3b2ca2b-25ff-4cc2-91e5-f8d43b3aef6a",
        "Identifiant8h": "83d49869-37cb-428d-aa43-3edaefe0d016",
        "Identifiant1day": "7ee68b04-e6f1-4ba3-8309-fdaf265a5012"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_PUITS_3",
        "VariableId": "b3c5a346-6cf0-4a40-83c2-22acec2f893f",
        "Identifiant5Min": "d43fcca0-7a0b-494a-8811-81ef0fa81ba9",
        "Identifiant1h": "adb73957-aba2-4b90-b04f-5a5c957fff7d",
        "Identifiant4h": "b0b06905-3bb3-43fc-b8cb-9a9a06c9102d",
        "Identifiant8h": "9b55f495-5ae8-46e9-87ae-ebba5f89a454",
        "Identifiant1day": "db2a9d84-b83d-4a6e-a50f-43a4cb21e066"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_PUITS_3",
        "VariableId": "a5ed1a9b-40f7-46bf-a633-2287ab3d927e",
        "Identifiant5Min": "897f6e34-1e54-4c83-8a39-933966a17ec3",
        "Identifiant1h": "58eb98d5-3d5b-448e-88c0-e6670f766424",
        "Identifiant4h": "6812e7bc-6a46-4e6e-9304-e476a819c4ce",
        "Identifiant8h": "02d3b76c-7d7e-4191-abef-d496ad166772",
        "Identifiant1day": "9625013d-8ea5-44ff-a918-ccabc8e797c8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_PUITS_3",
        "VariableId": "8a043bed-b39a-4016-b568-caa3af5c6567",
        "Identifiant5Min": "869cdd34-1687-45f2-89c5-7c8af06ffb7a",
        "Identifiant1h": "663e9310-49a3-4cce-98f2-2dab4a130fc2",
        "Identifiant4h": "584e0425-0537-4b93-82e1-5715e8ad1178",
        "Identifiant8h": "2f3aaeac-172d-474e-ac3e-28cdd332c8d1",
        "Identifiant1day": "7c5a3c59-4da3-48f1-8354-103c2ee6fa91"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_JANTES_LT3",
        "VariableId": "53b244fc-7bdb-49e6-b90a-28aa82efd6ab",
        "Identifiant5Min": "eb7e3e7e-cd6a-40ca-8a81-9a8a261a96b4",
        "Identifiant1h": "e84903a7-920c-4410-b27b-c94c4c141921",
        "Identifiant4h": "c58ea8bb-18d0-4fd6-98e5-1e0219b2b77e",
        "Identifiant8h": "f488f919-bd3e-4297-9428-2ff1d9bdb0c6",
        "Identifiant1day": "6fbf0dcc-4305-4cd7-9e1a-848aa0dd16e8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_JANTES_LT3",
        "VariableId": "ff2f7595-5399-40ba-8852-5bfb846d9c7f",
        "Identifiant5Min": "bc956d28-4466-4f1a-a797-e9314412c7a5",
        "Identifiant1h": "d8cb811d-4951-403f-9e4f-73eed45d9140",
        "Identifiant4h": "75738368-de82-4332-9ef6-27cada3f4c71",
        "Identifiant8h": "17de5345-4413-4754-b179-3485741b15ed",
        "Identifiant1day": "58931832-7444-424c-af88-f2284dad282f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_JANTES_LT3",
        "VariableId": "c46d7da2-ccd0-4fe6-aa89-ac50cc6efad4",
        "Identifiant5Min": "988a1eff-467c-4364-840d-6f3236614181",
        "Identifiant1h": "12f7a11c-8568-479c-817c-b9850fe69e8a",
        "Identifiant4h": "6d2353f7-4a00-4700-802b-6ec328dd612e",
        "Identifiant8h": "567ffb32-77b1-4428-b0ea-e09481be768a",
        "Identifiant1day": "33386c74-a4c5-4172-b105-0d710b196069"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_JANTES_LT3",
        "VariableId": "510b30ad-e6f8-42ed-bc5b-da34923938c1",
        "Identifiant5Min": "f7c4e43e-d605-4ebd-ac10-47bf758aa100",
        "Identifiant1h": "b252b5b1-c0b7-4430-a2ec-eb8572248216",
        "Identifiant4h": "cd7519e9-7185-4eab-a40b-14458e151616",
        "Identifiant8h": "3c93a3f5-9cf9-4a38-bb54-1243f3efdfba",
        "Identifiant1day": "2bd6caf3-8684-47c0-b952-41c51e771ff8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_JANTES_LT3",
        "VariableId": "0db52e0c-4b7b-47bf-8189-c736d9b1aac0",
        "Identifiant5Min": "9bd0d230-5300-470a-bfa2-b191fbd1f3da",
        "Identifiant1h": "9392205d-140f-49b9-a6ef-a74ba9358012",
        "Identifiant4h": "245d9da6-7c30-4a97-acf1-039b320e4f8a",
        "Identifiant8h": "66b041b0-bd7e-424f-a327-953bfdfb3bec",
        "Identifiant1day": "166b5437-ef01-48e0-9604-393308cc8420"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_JANTES_LT3",
        "VariableId": "b9da4396-c9c1-4e1e-95d5-d511df3434a8",
        "Identifiant5Min": "12bd63dd-6007-488e-9564-529e577e9ee7",
        "Identifiant1h": "6ef3241e-fcfb-4301-b1f9-319f0f03854c",
        "Identifiant4h": "b43dc1d9-0c89-4467-a430-8759bb7d2902",
        "Identifiant8h": "731e5340-321e-4ca3-938d-42863e15a279",
        "Identifiant1day": "1e92681e-bd54-49f6-af53-dc1035b1014f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_JANTES_LT3",
        "VariableId": "8f888f75-a83d-40d8-93fa-8d56c0350cc3",
        "Identifiant5Min": "1f100e07-e958-4d30-860b-d0ec6bf28687",
        "Identifiant1h": "8315d47d-5474-4b80-889b-2a516ea03caf",
        "Identifiant4h": "0175d7fb-b076-42e8-b98a-92169b3c09c9",
        "Identifiant8h": "dab8b2b4-d53a-4948-a7ee-d3741fef21a9",
        "Identifiant1day": "0847b127-45e8-4c3b-9f00-99eff8298445"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_JANTES_LT3",
        "VariableId": "c86f2235-01cb-42cc-bf2d-8a4dc99dec83",
        "Identifiant5Min": "771bc0ec-cc9f-47b5-8c71-e1c5439f4fb4",
        "Identifiant1h": "ceee2059-c02f-487b-a294-b289c6c7047b",
        "Identifiant4h": "d61bc8cf-8811-4dbb-9ddd-f503cfbfcf08",
        "Identifiant8h": "f828193e-ec7d-4fb8-86b0-e7d251865ff6",
        "Identifiant1day": "6244492a-210d-433c-85e2-4090132d7c29"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_BAT_5",
        "VariableId": "9714cc1d-9daf-4fb5-a5af-f0e119fa1052",
        "Identifiant5Min": "1f6c3447-9881-4192-b7cc-deeff0ed8270",
        "Identifiant1h": "c2be1713-af6d-41bc-ab1e-a4cfebc1cc5b",
        "Identifiant4h": "e48e23f4-5634-4ecf-b39d-7492b6ba257c",
        "Identifiant8h": "801e31e0-cd02-4991-be3d-fff137f13ded",
        "Identifiant1day": "c465156e-5b1e-45d9-b356-6a65235dca11"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_BAT_5",
        "VariableId": "fd146a39-2d8c-4cab-bc65-d260085eb1d3",
        "Identifiant5Min": "179859df-51da-4ff5-9cc8-03a96948256c",
        "Identifiant1h": "74c8fe7c-56b4-4d24-8d1b-5a085996de2f",
        "Identifiant4h": "fda8ba48-7459-43a4-9f39-776d44715830",
        "Identifiant8h": "3fb57788-b8a0-4175-b675-250df948f32e",
        "Identifiant1day": "f907bf00-bed0-4aa0-ab6a-375a44dcc5f5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_BAT_5",
        "VariableId": "3fa60cc2-2f04-4382-b610-798beac8ced1",
        "Identifiant5Min": "fa0477b3-5f1b-4435-af35-06e6f3cd49b6",
        "Identifiant1h": "5d628dff-54bb-44f2-9beb-138898ef13d7",
        "Identifiant4h": "e600817a-88ed-4427-957e-63fe8f46e3a9",
        "Identifiant8h": "346bb1a2-08a2-4bbd-88f2-6fd60d0799c6",
        "Identifiant1day": "11b031d3-bd7e-4db2-83ed-8c40c1c7bbdc"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_BAT_5",
        "VariableId": "75a73f9e-be7b-4a59-bcd6-d3163ac9c942",
        "Identifiant5Min": "2dabd9c7-5b9b-44f5-b0c7-9dd46a553d06",
        "Identifiant1h": "905a31d1-ff64-4ba6-8a7d-51a3574a6100",
        "Identifiant4h": "8d03b63b-f073-41d2-becd-59d1f2708fd2",
        "Identifiant8h": "80f0b677-384d-4700-aa9a-0ee4689edfd2",
        "Identifiant1day": "6e2c5fb5-b2d0-4afa-ab88-1526e485bc2f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_BAT_5",
        "VariableId": "17cf11fb-3d2b-4dd3-9b90-95cf288e42e7",
        "Identifiant5Min": "fb39048a-f5fa-482c-bb01-aece92e01ce3",
        "Identifiant1h": "72a60032-1ed8-49e5-b87b-60a5b770c304",
        "Identifiant4h": "15e84903-1c76-40d9-91ba-f54204979c1c",
        "Identifiant8h": "23df4f06-85e5-45e6-b970-695d639a02b4",
        "Identifiant1day": "9a479bb5-768d-42df-a9bf-371071dc8506"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_BAT_5",
        "VariableId": "dd9c2800-b8f8-4ae8-b19f-6f1b41e068e6",
        "Identifiant5Min": "268054bb-c257-4ecf-b70f-a5049ec5d5c1",
        "Identifiant1h": "20dfa65a-2309-4836-ad22-7648264376b2",
        "Identifiant4h": "a86e0092-8648-448b-b12e-c2eb84aede7c",
        "Identifiant8h": "8fb0b7a5-af1b-4232-a938-0e5631e4fe3a",
        "Identifiant1day": "d59aa4fd-1531-4ebc-a4cb-e714eb6080d0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_BAT_5",
        "VariableId": "6923425e-bc12-4568-aaa5-7708d304bbb6",
        "Identifiant5Min": "7300453c-25a4-4606-9073-8005400e00c9",
        "Identifiant1h": "867dc2c8-61f8-4ea5-a43b-a9d0f357b459",
        "Identifiant4h": "c46f8fa6-788a-4a8d-a7db-f2394649f209",
        "Identifiant8h": "65943c2e-df25-4b14-8624-90d96c489fc4",
        "Identifiant1day": "d66f419e-080e-42bf-97a9-8acf2265c298"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_BAT_5",
        "VariableId": "25b7de9a-ba71-42c9-af1f-fd4836e4b26b",
        "Identifiant5Min": "cca30a91-7d7c-43c5-9043-4f193475c946",
        "Identifiant1h": "e6f4fb6d-a92f-4c56-b3f6-5321a85c645a",
        "Identifiant4h": "62780c41-626c-4c56-8150-1dfe8b112958",
        "Identifiant8h": "86328d85-fd5e-4c51-8513-d99f83294904",
        "Identifiant1day": "13a44aad-5f80-4b39-b253-2e197a95b268"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_ECLAIRAGE",
        "VariableId": "8a9c7609-6f8e-4c35-b5c6-3527889dd22a",
        "Identifiant5Min": "a803d065-28ec-4d1c-ba8d-aba7159f1d04",
        "Identifiant1h": "51a5d611-eba2-456e-966d-92d650f11ef3",
        "Identifiant4h": "bc47d6e6-7ee0-4b48-b2dc-18a4f074507e",
        "Identifiant8h": "f1a1c53d-7cce-480b-949e-7d07c37309fd",
        "Identifiant1day": "7277e2cf-ed87-4fd5-ad38-19385a78331a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_ECLAIRAGE",
        "VariableId": "c96e2ad7-6d90-4bca-8144-f6a33eb55c0f",
        "Identifiant5Min": "d754ce41-de84-461e-a97c-5a57fd0df7b4",
        "Identifiant1h": "a1e295da-cadc-4c9d-998d-ff37b7c26909",
        "Identifiant4h": "87af1b1f-8d6e-4411-be1d-a292bb3e04a9",
        "Identifiant8h": "8f85e9bd-f219-446a-b46f-98e6e5cc0645",
        "Identifiant1day": "93439f4d-23fb-4d62-9edf-02d1c32c537b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_ECLAIRAGE",
        "VariableId": "a6a36798-a2a3-4c4e-8932-2da2170c9fba",
        "Identifiant5Min": "8feba26e-1268-43b3-bd8f-c8329e3108a0",
        "Identifiant1h": "860cb6a5-256c-4e6a-99e5-f5299d6d4fc5",
        "Identifiant4h": "af5ec524-d41c-4682-ac4b-833ef5bee414",
        "Identifiant8h": "9dc6c091-4255-4a31-a5e1-1a6885e4ce5a",
        "Identifiant1day": "ff78d661-fa55-47dd-875c-b48d2c0c499f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_ECLAIRAGE",
        "VariableId": "a4668af3-d2c0-4bad-a337-523a3e5a5037",
        "Identifiant5Min": "5c38abf3-34e1-4374-8ab9-28bc7a29fb13",
        "Identifiant1h": "7818d4af-fcc6-473b-9eef-eb72fb6cf7bd",
        "Identifiant4h": "271860b6-361c-4be5-a59e-cb04a04567a6",
        "Identifiant8h": "60ace41a-f620-4e13-8948-455ea7eddcac",
        "Identifiant1day": "bf4f3702-54e4-413d-9f7f-5e3aee3c64f0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_ECLAIRAGE",
        "VariableId": "d0610e11-18f3-4c22-a54a-76cc94ef5a7a",
        "Identifiant5Min": "bb342e76-9f1b-40ef-9e7e-4176cee14ca8",
        "Identifiant1h": "f47df9f7-97f3-43d4-ac14-1463257a4e5c",
        "Identifiant4h": "6e349dac-fc76-46c8-8b6e-04ac522bd955",
        "Identifiant8h": "c670be68-f15b-42a1-bcca-97cba0e44963",
        "Identifiant1day": "525cec52-3099-4f7a-b643-d0e5c208589b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_ECLAIRAGE",
        "VariableId": "f70704a3-7ab5-4e23-ab9a-46f9726f01f2",
        "Identifiant5Min": "a607a68a-3a96-4fea-90fa-1ccedadc37d2",
        "Identifiant1h": "5e2ea0f5-b349-4539-997c-f44430322b89",
        "Identifiant4h": "fa92a659-8c82-4ba4-8134-b76c5da36213",
        "Identifiant8h": "f9f67943-a657-4d72-9a4a-673b14858741",
        "Identifiant1day": "90de8ac3-7219-4409-893d-dd33eb096420"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_ECLAIRAGE",
        "VariableId": "5cfb247e-9849-428c-990b-04fe46260a28",
        "Identifiant5Min": "d3d39c2b-22c9-4e75-b18c-102a3c9d64d0",
        "Identifiant1h": "a60c7fdd-8536-418a-a7ed-289321e570f4",
        "Identifiant4h": "6b1ab7d4-60db-4764-98c1-5b850c415b1b",
        "Identifiant8h": "c2259170-6f39-46b5-a0bb-0389cd949ca6",
        "Identifiant1day": "6e4403b7-7c30-4c02-b105-2fb4a9fa5d44"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_ECLAIRAGE",
        "VariableId": "6e52743c-06c4-4217-8b00-2e6f822e25f6",
        "Identifiant5Min": "54572ac9-f096-49d2-8699-c106d9d6ac15",
        "Identifiant1h": "2e7827b6-401b-4a21-93bc-35561ed0deda",
        "Identifiant4h": "e0a3ac09-cddb-4942-aea5-d7a9942e61c6",
        "Identifiant8h": "21e4c45d-11b1-4044-ab9e-156cd48e1045",
        "Identifiant1day": "bbe7e594-64ef-4b09-a35a-211efa7ffb21"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_LAQUE",
        "VariableId": "17245d61-9535-4021-a0ff-fa63a26f3c1b",
        "Identifiant5Min": "baf672a4-6f50-4769-90e8-ae90966055e8",
        "Identifiant1h": "84bf7ac1-d2f5-4918-8bfc-18e1a18ba340",
        "Identifiant4h": "80c56ad1-69f8-407a-a4d1-c20138ad8aed",
        "Identifiant8h": "610240f7-9619-429b-86ec-028cb1b7ceae",
        "Identifiant1day": "8ba1135a-fa4f-4d53-bf79-5f1700e90f64"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_LAQUE",
        "VariableId": "e82513e2-6eb7-46d7-ba6a-c082ff63a47d",
        "Identifiant5Min": "fab2106f-a1c0-4fbb-80fa-19ed3ea9e1a3",
        "Identifiant1h": "f31bb74c-7cc1-47d4-b486-d70cf25957f0",
        "Identifiant4h": "d115f378-bb46-4858-ba72-1d19756652ac",
        "Identifiant8h": "dac202b8-2330-42d9-b5d4-5616d1c0bb8e",
        "Identifiant1day": "7d5f1661-b501-4fcc-92b7-55fa9ea986d3"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_LAQUE",
        "VariableId": "d9214ca9-b2fe-4e23-bd8b-5ca929eccd1a",
        "Identifiant5Min": "7e647327-e453-465b-a6b6-c0d154cded28",
        "Identifiant1h": "c6a2456e-610f-4261-9abe-ab52400a23ed",
        "Identifiant4h": "d3e31a22-47d7-4abe-bcba-059e109d0a70",
        "Identifiant8h": "3d09df22-947c-4929-abbe-5eb621fec22c",
        "Identifiant1day": "548d9ae4-14c4-4065-a8d0-c6e57f5d7eb1"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_LAQUE",
        "VariableId": "880ffbd2-6b5f-49f5-858d-b732fc383ef1",
        "Identifiant5Min": "c9fc15dc-8f28-4a8e-ad48-9194f2429dcc",
        "Identifiant1h": "b41c8cf5-8f4f-4cfc-be7c-d10008adbd81",
        "Identifiant4h": "d27eb937-826c-42d7-a0c6-a33aee5d8186",
        "Identifiant8h": "57db5e23-849c-40a8-b936-886d1692ca40",
        "Identifiant1day": "611417bb-1e4e-4384-a0a2-82d2f833ae52"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_LAQUE",
        "VariableId": "83059cca-8ff6-483f-b063-a304cbada91c",
        "Identifiant5Min": "dd805000-d454-421e-85db-d8384a4544c1",
        "Identifiant1h": "6a22d9a6-c398-4b1e-8e8e-0bc01e116f7d",
        "Identifiant4h": "c36f57d8-de51-4837-970c-914ea7993619",
        "Identifiant8h": "2d7fce81-f0c9-4e8b-823e-0ad6a25cc642",
        "Identifiant1day": "77cc1c8f-01dd-4d47-8434-65fc47e92185"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_LAQUE",
        "VariableId": "5b8cabeb-baf7-417f-ab69-90c744f11c4e",
        "Identifiant5Min": "12d8d7ab-8254-4195-bcb8-2a2ff551545d",
        "Identifiant1h": "940a9524-f318-4ec2-85ac-515795fecf6f",
        "Identifiant4h": "7138f093-7ec8-4a44-afc2-c0e016358669",
        "Identifiant8h": "211aebf6-0e5f-4875-b39a-5aab79ce3c14",
        "Identifiant1day": "feac1008-cc3e-41b0-a61c-b97ee6989b5a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_LAQUE",
        "VariableId": "6658a401-7fb3-4286-a557-a75aa3d4d0a7",
        "Identifiant5Min": "2767d652-5ec2-4bb2-84cd-65caabf8f0e2",
        "Identifiant1h": "760fd1fa-4ebe-4d7f-8e60-f54552a901da",
        "Identifiant4h": "5e516628-7e35-47ae-bd1a-93db0fdb922d",
        "Identifiant8h": "9a378d7e-470b-40ef-b29a-11bac4624257",
        "Identifiant1day": "e24df98d-dc5e-48f9-9362-71a3bf943296"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_LAQUE",
        "VariableId": "806164fe-5086-46ff-8061-bc985d35ec97",
        "Identifiant5Min": "d91a6cdc-5045-4425-9d0c-531fe6ac9c7e",
        "Identifiant1h": "44bb0cf3-5c4b-4511-8fb5-f104b7727359",
        "Identifiant4h": "edc6845e-ec0a-477f-af8c-2816edd36cca",
        "Identifiant8h": "b9603d7e-ed1a-4fc6-80d9-b3713dbd2514",
        "Identifiant1day": "ad3244c4-17a5-4baa-ba1c-880b045033a8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_1240_1_ZR5",
        "VariableId": "b429c1c7-255b-4138-9146-f64ec00d66e4",
        "Identifiant5Min": "efb3d804-86bc-4b44-8a83-7bcb6e33fc0a",
        "Identifiant1h": "096618da-8f7b-44c0-9042-fc1f767673a3",
        "Identifiant4h": "22d9754b-f4d3-4d0a-aaa1-5194f15c39c9",
        "Identifiant8h": "25afb308-fb3f-4505-aa30-90fd7cf8cddf",
        "Identifiant1day": "42e3fd80-9e56-4c1f-a9e0-fc52ddb1afe3"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_1240_1_ZR5",
        "VariableId": "3654df53-8de7-4a15-8bbb-b3bfe28eb6ba",
        "Identifiant5Min": "8fb41a80-d592-477b-a002-dbd2adfec120",
        "Identifiant1h": "0c93dce6-2dc2-4911-9dc4-f853fac80a12",
        "Identifiant4h": "bc97ed8c-ebb3-4188-a396-09e0f3b2ee6e",
        "Identifiant8h": "0019b474-db60-449b-89a9-47ed5f86768e",
        "Identifiant1day": "254ef8d5-33dc-4dac-99b9-0c14aa39250c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_1240_1_ZR5",
        "VariableId": "779183b0-5bed-45dc-a524-67e58c3c7629",
        "Identifiant5Min": "aee67f00-094d-491f-aade-3586c0d3226a",
        "Identifiant1h": "e540bc38-bf49-4bca-9091-f5c4fc7f2b31",
        "Identifiant4h": "520c9d72-7843-4d28-8d47-048c95e99dd8",
        "Identifiant8h": "e11611d3-ea30-4c60-bb91-d951027282bf",
        "Identifiant1day": "625e1a89-92db-45bf-9e17-f7c92ee5a13e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_1240_1_ZR5",
        "VariableId": "93e81bfe-a6bf-41ee-ad3d-5f39bac0c7bd",
        "Identifiant5Min": "b7a7fc9d-2726-48b5-bc09-4e97a52b9f81",
        "Identifiant1h": "9fd0abd7-935a-45a2-ad95-3e6a6e5e9503",
        "Identifiant4h": "13521eeb-29fa-49a7-a186-e2e4506565c4",
        "Identifiant8h": "6ff48559-522b-4d32-a28b-306ca7553424",
        "Identifiant1day": "80d4dd3e-3108-4a96-bdf5-97aceaeee7fc"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_1240_1_ZR5",
        "VariableId": "c74f6cd2-d95e-42d0-8b05-795ea5afda9e",
        "Identifiant5Min": "1f80562d-d973-457b-8a02-df833abf14ca",
        "Identifiant1h": "b162ff05-50af-44bb-93d3-56c7f21ced52",
        "Identifiant4h": "b9a24c0b-7f06-4a03-89ad-5f59c0c476c9",
        "Identifiant8h": "f4e24278-9b86-48a0-a5a3-7c79ba9816ed",
        "Identifiant1day": "a7a78267-aa84-436d-ac4a-a7e9b17cb95b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_1240_1_ZR5",
        "VariableId": "c131e2bd-da7d-4883-b789-91bdef4407ab",
        "Identifiant5Min": "c2f790c7-3932-4d75-9eeb-a618d187c36f",
        "Identifiant1h": "4fea513f-74b3-47c1-9e8e-1cf9b86f1b42",
        "Identifiant4h": "da327c13-63e3-4e34-b253-09f92fd12a8a",
        "Identifiant8h": "bf9502e5-ec35-43ad-b720-7603bfcbfd99",
        "Identifiant1day": "313d2392-a0a1-4d30-8d9d-8c6eb50b9c11"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_1240_1_ZR5",
        "VariableId": "713c08ca-80d9-493e-b87c-7ce205d69e83",
        "Identifiant5Min": "5c5539e0-d75c-4866-834e-430ec7b37def",
        "Identifiant1h": "76bfe971-5351-4d85-af95-a71516e5c3b7",
        "Identifiant4h": "4434d7a9-3a11-46c8-af83-2a561fd22ef8",
        "Identifiant8h": "423c06d0-b046-4edd-aae4-d349a5e6833b",
        "Identifiant1day": "3b791081-4acf-425b-a14c-5887714133cf"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_1240_1_ZR5",
        "VariableId": "e060dcfb-dc87-4adb-b329-1fddb9ac589f",
        "Identifiant5Min": "1810817d-362b-4d35-961a-e52acf2a3b40",
        "Identifiant1h": "8e4111c8-dc27-47df-971a-0866195c4ec1",
        "Identifiant4h": "8d9b4cb3-7088-4044-85f0-50564db25e7c",
        "Identifiant8h": "6f6208bf-b602-435a-a8b7-eb2d939c5a07",
        "Identifiant1day": "485d6128-6fa5-4330-bbb6-e210bbf28223"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_1241_2_1241_3",
        "VariableId": "e6b3ba2c-86fc-4745-92c0-876c46b91fbb",
        "Identifiant5Min": "0d846da5-d7e1-46e3-98f0-b547521bd9d8",
        "Identifiant1h": "12464589-14b8-44f5-ade8-075f3532faa5",
        "Identifiant4h": "0101ec8f-3993-46d5-abac-674554e87490",
        "Identifiant8h": "5e713aa5-1923-4330-ba99-76922c97da4a",
        "Identifiant1day": "42802551-30d2-4fbd-9212-ffd03b9cdc3e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_1241_2_1241_3",
        "VariableId": "927488ac-c00f-4cfb-b696-5699ae35dba8",
        "Identifiant5Min": "b594532e-56fd-42a9-ae3f-84087aa4d3ed",
        "Identifiant1h": "937a522c-9636-403a-b0bb-af5c48aa2448",
        "Identifiant4h": "18530149-5777-49d6-af7b-173a24c440e4",
        "Identifiant8h": "aa6f05f2-9b5f-4565-b18e-0d6b2ff354ef",
        "Identifiant1day": "e0a69cd4-7615-4e92-85d3-0629e75656a6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_1241_2_1241_3",
        "VariableId": "d6af2dbc-7c9b-47f7-a0c1-dd8a1440f603",
        "Identifiant5Min": "8c8ce14f-6313-488b-ac89-e912037743ee",
        "Identifiant1h": "63568d59-def1-46a0-986e-a187c4705687",
        "Identifiant4h": "42e69f9d-813e-4998-a45f-9f95f6961d9d",
        "Identifiant8h": "1d397202-7c8f-416d-b264-77e288fb0f0a",
        "Identifiant1day": "8d0c9dab-b386-413b-b280-6634536f147f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_1241_2_1241_3",
        "VariableId": "1a22187a-a328-4d32-b5f3-7737f8ee9a8e",
        "Identifiant5Min": "e20a3dcf-cb7b-41bb-9b37-3893b42c5cc4",
        "Identifiant1h": "304b9163-37e0-4c9a-af21-517a0df3d195",
        "Identifiant4h": "db46a57d-b7f2-466f-89c0-4144be843f62",
        "Identifiant8h": "b4f9b211-ee67-4104-8f1c-30939e83144b",
        "Identifiant1day": "6e9146ed-ecca-467d-bb5e-b904e46e7207"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_1241_2_1241_3",
        "VariableId": "0b925a67-7d5c-474e-b858-360152c2de48",
        "Identifiant5Min": "8fd5efeb-0782-4d20-b197-66bfd7be637b",
        "Identifiant1h": "f6018f55-7078-4c0c-99ee-2d04c946f463",
        "Identifiant4h": "e0c9ddd5-cecd-4ecf-88e1-3589dd1793d7",
        "Identifiant8h": "66ba52c5-f2f6-46d7-8640-45f8e74e94d7",
        "Identifiant1day": "abebde4d-97bd-4108-a7e4-46343c6cbde7"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_1241_2_1241_3",
        "VariableId": "e90f6fd0-e809-4169-ba36-d692bb1de8f9",
        "Identifiant5Min": "0340c1d5-961b-47b5-b720-eceda8a5becd",
        "Identifiant1h": "f98628a5-9df7-473e-b272-9344c101260f",
        "Identifiant4h": "5b537c05-7cc6-42d9-a25d-c104909904b8",
        "Identifiant8h": "44c1f6d8-1ae2-437a-afc5-0eda2edc8e71",
        "Identifiant1day": "d8ca023d-1f89-402a-b3ae-68ecaf9dcb12"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_1241_2_1241_3",
        "VariableId": "9fb907b0-8112-4698-9016-957f7846d953",
        "Identifiant5Min": "b72d6f97-bd34-4a6f-ae53-bdb31b6239f0",
        "Identifiant1h": "8592fedc-3090-494d-83bf-4e2cf53cd5a6",
        "Identifiant4h": "5041ab2f-2c89-4faa-bc6d-b5910c3567f8",
        "Identifiant8h": "72c944e8-e0e7-4300-bc98-ed15057a4ad9",
        "Identifiant1day": "1ce9d5ae-3535-4fda-b8f7-2fa07c625582"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_1241_2_1241_3",
        "VariableId": "0a26c422-c12e-4495-bc51-1c9f340605bc",
        "Identifiant5Min": "f1ed88f7-9d89-4aa2-895b-f1ddfeb04368",
        "Identifiant1h": "d906864b-2081-4736-9def-2b900750e1ab",
        "Identifiant4h": "89a54080-230b-4658-9ff7-bf2d01c890b3",
        "Identifiant8h": "22b1d4a4-1d14-490f-bae8-e11746156dde",
        "Identifiant1day": "2799cace-6485-4e30-8e47-eecec6d3a037"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_TAR_AC",
        "VariableId": "f5f8af2d-bf3c-4a96-b177-51a2abde9fea",
        "Identifiant5Min": "f5186a77-27cf-48a4-b319-8d8ef0cc65a8",
        "Identifiant1h": "c35b0171-0d4a-401c-8533-148808dbe687",
        "Identifiant4h": "7490104b-5ff0-40e8-93ef-df9d3b25e093",
        "Identifiant8h": "6a4ccf63-3ebf-4927-ab8c-016aa829293b",
        "Identifiant1day": "ec662811-d4ba-4b31-a881-9553453e8fd7"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_TAR_AC",
        "VariableId": "536cbbd9-c6fd-46db-b128-837cb6b520dc",
        "Identifiant5Min": "c8f230b2-d10d-4ddc-a841-cca5b6a9a82b",
        "Identifiant1h": "120e7afd-9cbe-40ff-b8f5-0388c490e021",
        "Identifiant4h": "54201e55-842d-49fe-90f0-197f99b4cdd3",
        "Identifiant8h": "cc9a1807-2f7e-4cfa-a3e0-c4d7a9b914e1",
        "Identifiant1day": "269e7d84-a73e-41a0-a3e9-a025477b4ca0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_TAR_AC",
        "VariableId": "124aa7b6-1be1-4c40-ac35-7b4e39e400b4",
        "Identifiant5Min": "253ffcb4-eb42-4006-9842-ef5408ad85b4",
        "Identifiant1h": "55040688-82ab-4eaa-8144-8410271febba",
        "Identifiant4h": "ef58f475-f30c-43d7-95ec-f83577d3c778",
        "Identifiant8h": "a95044cb-03f2-4b40-9353-a937282eab35",
        "Identifiant1day": "73d40320-8917-44c7-8bbb-dc46af485450"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_TAR_AC",
        "VariableId": "d3e37f83-f167-4f57-96f2-cbf47ef97eb8",
        "Identifiant5Min": "761ea618-37cc-4c8f-973a-39684dc317a5",
        "Identifiant1h": "df4b06ad-64e8-4896-b217-269c60d83dab",
        "Identifiant4h": "e6d32db7-2c4f-4970-b364-f11efeae15dc",
        "Identifiant8h": "3a8f157d-f11a-4a9d-b6da-0a1cf8fcbf1d",
        "Identifiant1day": "f5e8ffdd-7619-46d8-a8cc-f9411d783788"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_TAR_AC",
        "VariableId": "a067bc99-ee6f-4274-a1cb-b9ab0c204783",
        "Identifiant5Min": "d3bc8c0e-bfa0-4be5-948c-3ff9727cb889",
        "Identifiant1h": "df97940c-58e9-4b11-adf8-53e1d205fbc7",
        "Identifiant4h": "e5800d84-223e-4bbc-af87-ba6386a13a29",
        "Identifiant8h": "0bceca9c-9e1d-4be4-b2c5-3e6d3b2203d5",
        "Identifiant1day": "ec99a160-eaf0-4e25-8d38-2ea5e260c4e2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_TAR_AC",
        "VariableId": "e9eec0a2-5e42-4aef-aec3-01e90c95756f",
        "Identifiant5Min": "c5853266-9c59-4df3-b70f-5dd06ca9257c",
        "Identifiant1h": "7cdb863c-8f14-44d3-9ef9-c8d4fb00c130",
        "Identifiant4h": "b647087c-e3c6-4541-8de0-f93a440b3caf",
        "Identifiant8h": "53aec444-f655-4dc5-ac58-9ce547e87b5e",
        "Identifiant1day": "4a535b41-fde0-4486-a260-2aaf29dc2ae8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_TAR_AC",
        "VariableId": "d4ce083e-c233-4dc3-8bd3-c2f85490fb05",
        "Identifiant5Min": "7e648ccc-b2c2-4a75-9968-df09c669fee0",
        "Identifiant1h": "86245d9b-d9b9-4d2b-8bc6-48a5537f9e31",
        "Identifiant4h": "58ab3d92-4141-4cf7-8e43-b23c75ac596d",
        "Identifiant8h": "207cc76e-7231-4cc1-9a10-a4c61eb28270",
        "Identifiant1day": "6fab203c-5615-4dd5-825e-1abb815b9c67"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_TAR_AC",
        "VariableId": "16412e79-ac71-4959-98ce-a92a64fb06b8",
        "Identifiant5Min": "3d057d23-601c-45dd-92b4-dd5e7b6e0688",
        "Identifiant1h": "5f0212fb-9ce4-4719-b884-41a226115e28",
        "Identifiant4h": "5723bba2-3604-4abc-a6ed-6cdd826086d8",
        "Identifiant8h": "3ac4e625-908c-4fa3-9e22-42428cf74bc4",
        "Identifiant1day": "f7dda4ca-1305-4b8d-a0d7-0e88d8a4157a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_1240_6_GA18",
        "VariableId": "428b3ed7-2046-4375-8564-964561185aef",
        "Identifiant5Min": "dd2ebb2b-3dad-4c5a-b6fa-40762e9289d2",
        "Identifiant1h": "320bd0b1-28c8-48c9-abf4-03021c8e3f2f",
        "Identifiant4h": "0d78b7c5-41df-4ad8-9dd1-4fd72a558a4f",
        "Identifiant8h": "1d32d074-5cdc-4a74-a2f9-bf6d693f54e5",
        "Identifiant1day": "9dcb42b4-80aa-4643-a75f-1f7a0ed1ffac"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_1240_6_GA18",
        "VariableId": "465a790d-86d9-4044-99bb-7cda70843942",
        "Identifiant5Min": "b2f854e8-8b11-4cfc-84be-a14a21bd3a60",
        "Identifiant1h": "4452a72d-6c50-4a5f-b370-43334d2f41d9",
        "Identifiant4h": "61e78739-147b-4b80-bd3b-39eb1a372903",
        "Identifiant8h": "aa566082-779e-47a6-a8ad-a4a8f1af0184",
        "Identifiant1day": "2f53fd9f-c045-4ba1-97f6-9cf1ba153980"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_1240_6_GA18",
        "VariableId": "958f6f5c-b818-4f56-bc98-892eb98a113a",
        "Identifiant5Min": "a3487c8c-b095-4c11-8971-729552e6f1eb",
        "Identifiant1h": "a46797ed-faf5-4b46-bc53-9fe2db1c006e",
        "Identifiant4h": "7de885b6-281a-474c-95de-1830de21e263",
        "Identifiant8h": "73f9c924-4d33-4e36-af50-541509346d4e",
        "Identifiant1day": "3bc06551-3485-44bb-8027-90a248ca09aa"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_1240_6_GA18",
        "VariableId": "8927bb1c-ba3e-4ce4-a385-b8b89ca66d51",
        "Identifiant5Min": "b60d87ef-9191-4813-bf27-f4f70c5f4596",
        "Identifiant1h": "45010f70-cacb-4468-a008-b17af819194d",
        "Identifiant4h": "6407d316-d3dd-44e1-8ef3-5c990340e390",
        "Identifiant8h": "4c33f003-9a88-4ec5-a3bf-103f4d5d5ed5",
        "Identifiant1day": "a3dde267-a268-4cf0-b78f-f3fa8a25cfb4"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_1240_6_GA18",
        "VariableId": "f3ffb744-cd60-4ed6-a050-2f1d62bcbeb2",
        "Identifiant5Min": "45eb022d-3650-47ca-8019-a9e8ca32e455",
        "Identifiant1h": "bb102f71-f73a-4a17-a361-fda174912610",
        "Identifiant4h": "a058e470-0e99-4bfc-a516-0ef380f219ba",
        "Identifiant8h": "d35b0fb3-65cf-47f4-96a9-932dc6b80a1a",
        "Identifiant1day": "3d67689a-9c08-4784-a8fe-7dc5ba0a7cab"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_1240_6_GA18",
        "VariableId": "ed192574-af7c-4d88-8de2-4d1f3131c8ba",
        "Identifiant5Min": "df620902-b573-4531-b39a-ddba29b3ed7c",
        "Identifiant1h": "167ca4a8-6768-4486-b692-4c3b4fea00e0",
        "Identifiant4h": "a0b00994-1906-46dc-b154-27bcdb1178a3",
        "Identifiant8h": "49d57b93-1a0c-42c2-afee-88ed87bf051a",
        "Identifiant1day": "9278ddea-a357-4a44-ad96-75840044384c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_1240_6_GA18",
        "VariableId": "571fb484-1553-4f60-831c-fe77d8820545",
        "Identifiant5Min": "97374757-985e-4346-9de2-98b6558d4970",
        "Identifiant1h": "42cbc502-2dae-44c5-a48f-54eefe4682a5",
        "Identifiant4h": "f9984932-9ada-41b9-89d5-b4cdab71a6ec",
        "Identifiant8h": "8c771caa-f93c-475d-9538-ede2ebc7ae84",
        "Identifiant1day": "63304ef6-2f9f-4770-912c-f60ed13621ad"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_1240_6_GA18",
        "VariableId": "74dadc05-4814-47f4-8a94-d2962cebe313",
        "Identifiant5Min": "6025e264-d44c-4bbf-bdb1-b0c99f244684",
        "Identifiant1h": "72b1878b-0eba-4e78-8697-8b0c9916984b",
        "Identifiant4h": "e4ced000-a492-48d5-a313-6796f91590b4",
        "Identifiant8h": "a7decd93-1cb5-45d7-adb0-0d79fc5c34fb",
        "Identifiant1day": "24933929-2d0a-4cfe-906e-3953543be9c2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_GENERAL",
        "VariableId": "70675e3d-2388-4beb-8ab8-ffeed3c93c3e",
        "Identifiant5Min": "8de70d37-8923-4b81-a392-0c469773eebf",
        "Identifiant1h": "62275724-efab-4ebc-97f2-f9c3b0073af8",
        "Identifiant4h": "1739b6da-200a-4cbb-8ed0-28b82e7dccfb",
        "Identifiant8h": "c20249c9-afb0-4ce5-bae0-19ff7c246e27",
        "Identifiant1day": "53b1d4d9-38d8-4dde-8e27-0cce982b1956"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_GENERAL",
        "VariableId": "ba14eec2-e3cf-48f9-82ff-2e09a3b43486",
        "Identifiant5Min": "ded6733d-079e-4881-ba9b-73695b7f432b",
        "Identifiant1h": "56769405-7dd7-45a7-9839-d06d4e0a72e8",
        "Identifiant4h": "e2be7061-0790-4985-8bba-74b8c6cc8e81",
        "Identifiant8h": "50f1f026-5e9f-4d17-80ff-13aca1bbdebb",
        "Identifiant1day": "b3e3e02d-7f1e-4718-b649-c66a327e5abd"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_GENERAL",
        "VariableId": "22187fde-55ea-41d5-a646-760b63f6c564",
        "Identifiant5Min": "bf4ac946-e052-4297-b77d-993169be1d33",
        "Identifiant1h": "3d46704c-16b6-4e94-bccc-d8009ec1eb4a",
        "Identifiant4h": "e287a268-2032-4944-966a-109276d5c5b7",
        "Identifiant8h": "df74c320-7d0e-4007-9227-262c9484b824",
        "Identifiant1day": "75568b1f-afbd-4558-b718-45881ade46fe"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_GENERAL",
        "VariableId": "e360f76b-4645-46c1-93d2-3e66d0179901",
        "Identifiant5Min": "4e790434-5ead-4d8c-b7c7-9b5079d9c104",
        "Identifiant1h": "d72b24b3-a3da-479f-a69c-99db8d578624",
        "Identifiant4h": "149fa5f3-1e23-4e2b-ad49-c7c46576d445",
        "Identifiant8h": "8387ac06-76a9-4e80-a68e-ddb4c7041d03",
        "Identifiant1day": "53f4b8f9-2aa0-4ba9-b6d1-8c04d6fd485e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_GENERAL",
        "VariableId": "8ee92f3f-2b47-4643-bdf7-1b7258841d0d",
        "Identifiant5Min": "b7b3c148-50a1-469d-b7dc-1cee5d7018e5",
        "Identifiant1h": "58519256-9189-4f54-b6f3-2260ef77f126",
        "Identifiant4h": "4d570a8e-e6cf-4e70-81a5-dc6ab63a724f",
        "Identifiant8h": "e9a0d729-83b5-47ff-af30-641f6fc9c1b4",
        "Identifiant1day": "f8a99a32-3379-4f94-90b7-f9ffc648a589"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_GENERAL",
        "VariableId": "fe8495c0-58fd-48a9-801a-99edab0a6dc1",
        "Identifiant5Min": "33842267-505f-49b3-a6ff-02494d090324",
        "Identifiant1h": "e967cfb5-9a4f-4b79-9543-ee3f6c434bde",
        "Identifiant4h": "a1fca09c-cdd7-45fb-8b51-4e3349c59c0b",
        "Identifiant8h": "4dc6b315-5d7d-4d12-a74a-e295476c3f3c",
        "Identifiant1day": "58dab4e9-4698-4e05-adcf-b665e5e1e7c6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_GENERAL",
        "VariableId": "7d5a839f-4dcb-4796-8e16-26e367f37b8b",
        "Identifiant5Min": "7641bca8-46e3-4073-af9d-bfe32ecd98fd",
        "Identifiant1h": "ecf6a7d2-cd11-472b-bfed-302981bcd41f",
        "Identifiant4h": "3de93650-1dd0-4f43-9772-6744538a529e",
        "Identifiant8h": "02d38c62-b451-4cb4-8897-f01003595f18",
        "Identifiant1day": "b86c92a0-27d8-464c-bce5-3e71b88bc298"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_GENERAL",
        "VariableId": "c28c66dd-533e-49e2-8fb6-34302a319076",
        "Identifiant5Min": "455fc36a-934b-401a-90db-c66009a065e6",
        "Identifiant1h": "86808af0-5b9c-4ce9-951a-1f9d88bb22ff",
        "Identifiant4h": "6ab8b950-5b2b-4b4f-b6b2-d3baaeeaf75b",
        "Identifiant8h": "00a69910-9148-4fc4-89f5-3b77b26c96e7",
        "Identifiant1day": "2413ab43-84ee-4758-a584-079ec39a0781"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_1240_2_ZR5",
        "VariableId": "e9e9e6b4-857d-45b5-ac21-0560f45c0b8a",
        "Identifiant5Min": "7ef78965-40ab-4954-a8cd-07604551553a",
        "Identifiant1h": "2038a4bc-8194-4318-97d3-9f6b29d5914b",
        "Identifiant4h": "8c93c037-6dca-449e-8204-7bad64fd7411",
        "Identifiant8h": "a399d2f6-b813-4690-8230-ab8f93d945da",
        "Identifiant1day": "976d58d7-877a-4c4c-9006-c7014dae7298"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_1240_2_ZR5",
        "VariableId": "618dea59-dd4e-48ec-87a9-e4afe127ef39",
        "Identifiant5Min": "68824e58-1b07-4728-bcf0-586daff1e867",
        "Identifiant1h": "99a02e9a-16a8-4f1e-9b7b-20bee53e6369",
        "Identifiant4h": "975c61c9-e9df-42d5-95ba-9fb46a22d4bb",
        "Identifiant8h": "7e118c84-2234-43e4-952b-ab14d50870f4",
        "Identifiant1day": "31aea0b9-24dd-48c7-aeda-296b49d1ddb4"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_1240_2_ZR5",
        "VariableId": "c4d86a26-b90a-4ec5-bab6-e80c68c4855d",
        "Identifiant5Min": "2ddb4956-56f7-4ca1-9d5e-7a54b0ec84bb",
        "Identifiant1h": "9b5384df-112e-4827-a6a3-cd736e7946ab",
        "Identifiant4h": "786b04ed-0686-46ea-b47a-a7bcb3363fc1",
        "Identifiant8h": "861a8a14-d48b-41aa-98c8-33b0968a8cea",
        "Identifiant1day": "0cc16d1d-28e8-4f2e-8787-783cf6b49e1d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_1240_2_ZR5",
        "VariableId": "1038b2a5-9a45-496f-b8cc-c13397d6e1f5",
        "Identifiant5Min": "bd76287d-24a4-45a2-a2da-e6714e77644e",
        "Identifiant1h": "c9b01c21-fcd0-4fab-81f5-a42917edf1b6",
        "Identifiant4h": "462261ce-188d-4ca1-8d60-402c34e684ec",
        "Identifiant8h": "3349df54-c86a-4040-b4f9-662331da9d0e",
        "Identifiant1day": "90c34103-1a22-4011-8991-c23e221f4a03"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_1240_2_ZR5",
        "VariableId": "637c72a5-95f7-4b05-acd2-b9343d6b6a8c",
        "Identifiant5Min": "08231bb3-5589-47c1-b9be-f1fd6c8648ed",
        "Identifiant1h": "ea7f1f55-e559-48b1-9dec-e0fef48f8b99",
        "Identifiant4h": "51f7cec4-9a43-4cf0-880a-fad8a0036f74",
        "Identifiant8h": "fcd6f579-4362-4894-9bef-9eaeb2cab508",
        "Identifiant1day": "d4e37f9c-4ced-42e9-b5b3-b1c765e8c566"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_1240_2_ZR5",
        "VariableId": "fa8c24ab-afb3-4728-b100-c4a2272f72f5",
        "Identifiant5Min": "973b5232-1095-4b23-86fb-80dd87c10991",
        "Identifiant1h": "5f58ef06-cf2c-48c9-901a-01d8e61dd092",
        "Identifiant4h": "61c64712-6234-409c-b3bc-0f5b626fc77b",
        "Identifiant8h": "126e2151-5e3e-482f-8aa9-8a42380949da",
        "Identifiant1day": "5ad2e6e3-db10-46c9-9240-b1c258c62bd2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_1240_2_ZR5",
        "VariableId": "c96b0f2d-0af6-4a29-a9c8-7834d95b6f34",
        "Identifiant5Min": "b88032d9-5870-4ef3-ba55-a4bf3f7ee5ab",
        "Identifiant1h": "0cfac73b-87db-4ddf-aa63-cc59b0e2db0e",
        "Identifiant4h": "5823eef6-2cb5-4229-8921-d1749b719ed4",
        "Identifiant8h": "4cf1b2f4-2b9c-4883-9543-d2187a195c85",
        "Identifiant1day": "8fa1f1eb-1de0-4085-a1d6-e5a51bc66a68"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_1240_2_ZR5",
        "VariableId": "3cd9b91d-cc6e-4ee4-80de-223b4473d941",
        "Identifiant5Min": "80d70cf1-310c-424f-a3c6-ccc813613f5f",
        "Identifiant1h": "5f93b11c-1167-4404-9d04-507d08955bc7",
        "Identifiant4h": "8e3d2916-35a6-4a8a-b6c0-48123dae2ab5",
        "Identifiant8h": "f247bf27-0188-4914-89e9-7e91e4caa45f",
        "Identifiant1day": "2557934a-fd1c-45a0-8777-245e5751421c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_1240_3_INGERSOLL",
        "VariableId": "0baf1e44-badb-435f-add3-5d8bc3e5faa8",
        "Identifiant5Min": "1d43d111-fbfd-4488-b76a-c9d4afad9784",
        "Identifiant1h": "fa8b1a0a-8e4d-43d1-b919-5dcb6ccf844d",
        "Identifiant4h": "4442a202-a968-43b1-819e-7981d390c9b4",
        "Identifiant8h": "de0bb19f-cecc-426e-b227-ee41fd0c9b55",
        "Identifiant1day": "a6f885b9-0748-459a-990d-4238481d3464"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_1240_3_INGERSOLL",
        "VariableId": "07acc23e-a099-48a0-b793-dd26376363a1",
        "Identifiant5Min": "cd5262f1-c5b5-4d4f-8f13-0d8265fcc053",
        "Identifiant1h": "23ebd986-89f0-4db6-8edd-3269bba9d17b",
        "Identifiant4h": "8535187d-3eaf-42e3-880e-7276694940b8",
        "Identifiant8h": "8c558c63-58d9-4a53-b56b-11805433f8ef",
        "Identifiant1day": "8a8e3e83-66a1-4cc3-9d74-69c5febd6e69"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_1240_3_INGERSOLL",
        "VariableId": "1c674825-c6d5-45fe-b63e-511c0d3b6ad6",
        "Identifiant5Min": "a3a09b26-f758-4dfc-8a03-38efb653d275",
        "Identifiant1h": "c9fe2ff5-de6e-4369-87d1-40f82ba50836",
        "Identifiant4h": "4077dce0-6351-4e0e-9d05-554c360eac85",
        "Identifiant8h": "657a7144-23ea-4039-9749-3c6e8dff4799",
        "Identifiant1day": "b2b02983-2a18-4b9a-a7d4-0a481fc278fa"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_1240_3_INGERSOLL",
        "VariableId": "058dc25e-f0b5-4871-8fd3-e8c3d9d75f7c",
        "Identifiant5Min": "7ee90122-a2c0-4c22-8a28-abd9919cb23d",
        "Identifiant1h": "c462a947-e21e-43ea-9cff-1fc83c0b86e6",
        "Identifiant4h": "30bd417a-da07-4125-9894-ffbd3926573e",
        "Identifiant8h": "e075ddaf-a44e-4427-9293-7fca51da19ab",
        "Identifiant1day": "1c2c9711-5cf8-465e-8daf-5f0cd9f4c115"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_1240_3_INGERSOLL",
        "VariableId": "3b815838-829d-4006-8c84-183081e12d4b",
        "Identifiant5Min": "fe9e3ab3-d263-4729-bef0-11c001d15862",
        "Identifiant1h": "3aa6bc38-4777-4d88-a385-78b05119d345",
        "Identifiant4h": "3fdaa376-8ee0-4549-a1ca-1db043eb9865",
        "Identifiant8h": "5839275f-fb2b-46d7-9973-52c7f8d1ca9a",
        "Identifiant1day": "161d0c6f-6072-4e4d-8580-b760aa825eb9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_1240_3_INGERSOLL",
        "VariableId": "a593ac3a-cf07-47c0-b43a-9a9ae75c70c4",
        "Identifiant5Min": "aa1f995a-5c75-45ea-9f19-e02b0230abd2",
        "Identifiant1h": "36354773-9cc2-4c71-8229-eccc43729df5",
        "Identifiant4h": "35172d0e-00d4-43c0-9731-7e1b21e729db",
        "Identifiant8h": "c5692598-55f3-4d66-9233-dae5b1df7eda",
        "Identifiant1day": "0829abd2-e275-4716-ac8a-873859fc6430"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_1240_3_INGERSOLL",
        "VariableId": "0a9979a4-21ff-4e17-9daf-2d758b748db6",
        "Identifiant5Min": "996cac77-17a1-4e66-9832-3398463836cb",
        "Identifiant1h": "ad5848e1-6565-4dab-8e9a-2387fccf82db",
        "Identifiant4h": "38aac20e-7200-4c70-b1af-bc80349757ef",
        "Identifiant8h": "b1988ae2-c5f0-4dd0-82bf-1b0bb9489ca5",
        "Identifiant1day": "66155e32-0948-4757-bd0a-f76aff4aeb53"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_1240_3_INGERSOLL",
        "VariableId": "1ced89f7-6e85-4eff-8676-a73f5201443d",
        "Identifiant5Min": "433cffd8-b100-419a-9a2c-b983e8ba2087",
        "Identifiant1h": "8245d09f-c15d-4c75-a6dc-ac15094c0c1b",
        "Identifiant4h": "9f39a19c-1e14-43b1-b218-ca4d92157349",
        "Identifiant8h": "444fa142-bf79-44e2-86fe-b0553461bd67",
        "Identifiant1day": "a3b3765c-229f-452a-940d-b0bc85311491"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_1240_5_ZR200",
        "VariableId": "9eee520b-02a0-4a52-a398-29d578d2e447",
        "Identifiant5Min": "6d4b892c-405d-484b-a3ba-6118e8b9829c",
        "Identifiant1h": "fdb2b722-a862-41a1-a2b3-71f22ec73a4a",
        "Identifiant4h": "4e6524ab-5758-4f57-b768-652e0b09d242",
        "Identifiant8h": "f5dea892-5ea1-4532-b392-f269d9fa8a9f",
        "Identifiant1day": "c3ca8767-e94d-4204-a3d4-6a97b709c5e3"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_1240_5_ZR200",
        "VariableId": "3a8892a2-90e3-4a9a-af82-fa8aac310c00",
        "Identifiant5Min": "4fefaa99-86a8-4cde-a287-9556b0936479",
        "Identifiant1h": "80623f2b-6200-4859-b9e9-f2e6afe76f13",
        "Identifiant4h": "9e191bca-f46b-471d-8e0d-65ef31468382",
        "Identifiant8h": "d919eee8-3971-489b-990c-998664c8af8a",
        "Identifiant1day": "4d366934-4c5c-4b42-a89c-76efa47b9f4f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_1240_5_ZR200",
        "VariableId": "ff25de92-8343-4ebe-84d4-27d93eebd6e1",
        "Identifiant5Min": "d31b3fd3-d5bf-4066-a617-d13e94bacbd6",
        "Identifiant1h": "59cf992e-f3e8-430c-8f3d-22bbd8d4b591",
        "Identifiant4h": "9388a29c-a2b8-4ff0-9134-bacd2989f6e5",
        "Identifiant8h": "7f60e742-a1cd-4395-b8f5-49b4d86d7015",
        "Identifiant1day": "d51db911-a7eb-4633-97ec-9f1a233b7e3f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_1240_5_ZR200",
        "VariableId": "1a22e5ed-3904-4432-bd05-68ddd531588b",
        "Identifiant5Min": "1cf80ace-0072-4f6c-95f2-4fe19b414d88",
        "Identifiant1h": "b572eec5-bd8e-4bc1-a6f8-b42abdf57cb6",
        "Identifiant4h": "cd37803b-9f99-446d-8ebb-09ff0e3c3d08",
        "Identifiant8h": "b2ee1cea-bfd9-4408-8822-794696b19755",
        "Identifiant1day": "4b27e031-544a-47e2-8c15-484c1e55c07b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_1240_5_ZR200",
        "VariableId": "d5400eee-733c-49ec-9f68-3b8139cf06da",
        "Identifiant5Min": "7007ccd5-e1f9-412f-9ad1-2cc8bfded8f2",
        "Identifiant1h": "16e62796-fa77-4991-9d95-893f90f2bacb",
        "Identifiant4h": "7031b12b-abd6-4e8c-b7de-ed53bbf11db1",
        "Identifiant8h": "f03baae0-8549-4409-baaa-24830177e102",
        "Identifiant1day": "19a4749b-aacc-488c-9ed5-a7d7520fbbce"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_1240_5_ZR200",
        "VariableId": "def7000a-7c1b-4411-b47f-ade47e860619",
        "Identifiant5Min": "8086a8b4-b54e-4f43-a23c-3ae5630280bb",
        "Identifiant1h": "d50ca7e8-7839-4a67-b4a3-1d2656262b50",
        "Identifiant4h": "9a5b5218-8a23-49b8-a7fe-3c67681a8c11",
        "Identifiant8h": "60cc582d-1fd0-400f-b600-0eb92b27cc71",
        "Identifiant1day": "452d45b2-baad-4277-98dd-eb64de77f2f3"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_1240_5_ZR200",
        "VariableId": "8632f61d-28ef-4ea8-80d6-4a25007aa0ba",
        "Identifiant5Min": "fc3d6c31-8b7c-4bed-bf26-89cb2550c24a",
        "Identifiant1h": "1e88963a-73cb-4ece-a607-64e3f1bfbbbc",
        "Identifiant4h": "ef0e6870-240b-48c5-a73b-43ecb4c67e79",
        "Identifiant8h": "6f57b540-245d-4dbe-baa1-368904e019dc",
        "Identifiant1day": "32e1ac36-91c5-4ec1-bde4-b00816539829"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_1240_5_ZR200",
        "VariableId": "7852957d-3995-4476-a911-3f729d29c6a3",
        "Identifiant5Min": "e4be1044-4dfa-4777-93ce-223c62a5cb64",
        "Identifiant1h": "1bef50ad-660f-4c59-86e7-d0cea110e354",
        "Identifiant4h": "c0616c7a-e82a-4011-b0ee-42848e0bd05f",
        "Identifiant8h": "4c4717d5-a5bb-4116-aab6-efc3d0a258e5",
        "Identifiant1day": "7ca9218d-fb70-45cb-93b1-c0a7d74155e8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_1240_4_ZR315VZS",
        "VariableId": "cb9f8a7f-54cd-47e6-aa90-9aa97363a673",
        "Identifiant5Min": "101aa365-5cf0-4207-8863-51cb0295cbe1",
        "Identifiant1h": "30761a15-10aa-4d6a-ba6f-59ee770eed2e",
        "Identifiant4h": "63aa8ae2-2d62-4747-bfb9-c35b225f4d11",
        "Identifiant8h": "7bfe2902-d894-4399-8366-3c53bd000b70",
        "Identifiant1day": "c9829cec-1cdd-428b-b4c1-001f3b9ce9fb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_1240_4_ZR315VZS",
        "VariableId": "03151257-1b17-4ab0-b673-0f7eb5e983be",
        "Identifiant5Min": "6390cd5f-82be-4be0-a1e1-3402a20410bf",
        "Identifiant1h": "ad34e89a-9dcf-4409-9d06-c704921ad3ca",
        "Identifiant4h": "aca3e1d2-b29d-4e66-8190-2a149e0d33b5",
        "Identifiant8h": "26c5dab2-6a5b-42e6-a6f1-a2e18d8ee442",
        "Identifiant1day": "ecf0ed65-d48a-4eb8-9f4b-8747f2c51973"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_1240_4_ZR315VZS",
        "VariableId": "d912e055-a911-49c8-9355-d12d120da33b",
        "Identifiant5Min": "4ba169a7-1add-4cd5-a20c-120eadeb259d",
        "Identifiant1h": "e4328eea-2358-46fb-b094-91636d5be550",
        "Identifiant4h": "efc99cf1-a54e-41b7-89cb-1a7ff5a2017f",
        "Identifiant8h": "6de94f42-0736-4588-b842-db95008537b0",
        "Identifiant1day": "91717fd2-7db8-4d4d-be24-4ae0826f947b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_1240_4_ZR315VZS",
        "VariableId": "043fcbb6-3c4a-441a-b5a4-b6a99ccd1f41",
        "Identifiant5Min": "21e3dfc0-d65e-40ab-8e3e-c226e8690049",
        "Identifiant1h": "489ef971-6222-4ae6-99b7-bd0363ee6756",
        "Identifiant4h": "98c531f8-f447-4cb4-b74a-6abf1f731903",
        "Identifiant8h": "39ae21fb-149f-4a60-ab7e-488b21c55a10",
        "Identifiant1day": "0ac16d0a-3418-4aba-bd0f-b187c368ecd6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_1240_4_ZR315VZS",
        "VariableId": "73baa5ed-5cee-449c-ae63-ad33341ff6fe",
        "Identifiant5Min": "a552cb59-032c-41be-80bc-e96ffd2a45d3",
        "Identifiant1h": "1c852090-42f0-4c78-894c-fa58f3168177",
        "Identifiant4h": "589c48c3-a0fc-4ac2-bf38-edd37201eae9",
        "Identifiant8h": "255fad30-9571-48fe-b68b-3fc44eefe205",
        "Identifiant1day": "c4bf23e2-ee95-45a6-ba8e-096be051edd1"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_1240_4_ZR315VZS",
        "VariableId": "e21c0a11-89b1-4c2a-a22d-313818de6853",
        "Identifiant5Min": "0418c047-10f6-43ce-b3d7-16e91ea76a09",
        "Identifiant1h": "9cb58ba4-68d2-4e79-a610-94ab7afbbeb7",
        "Identifiant4h": "d05abef6-a2c7-4841-b11c-3fb43fee85ba",
        "Identifiant8h": "de101e2b-4d4c-4b19-95e9-d436175d41c5",
        "Identifiant1day": "d035f795-5a0b-4d5e-b71c-1ede491232f5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_1240_4_ZR315VZS",
        "VariableId": "1a9a6e13-7d96-4057-ac3c-2c62f17d8dc6",
        "Identifiant5Min": "b8f9720a-dc9c-4327-b021-ed98c43210c9",
        "Identifiant1h": "26d18c11-8c73-4e4a-923c-3cf5d427318a",
        "Identifiant4h": "061635cd-b013-4762-947a-239ceb6266cd",
        "Identifiant8h": "62f360e6-c49a-4117-b423-149e3f9afbf4",
        "Identifiant1day": "5e0c1b83-cb5d-4076-bffa-592da864d24c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_1240_4_ZR315VZS",
        "VariableId": "ce4b30c9-901d-4439-aeda-66604d30158e",
        "Identifiant5Min": "9890e2f1-8b7d-4b34-bdce-db69538c46e1",
        "Identifiant1h": "bdcd2ddd-3f0a-4880-a34c-dc2515125085",
        "Identifiant4h": "9a0dd691-d04d-46d3-8715-f6def79b6145",
        "Identifiant8h": "e3898218-91b7-4438-ba71-1662a9121422",
        "Identifiant1day": "603e1758-18a4-4d8d-b6a9-092e27815d8f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_1241_1_TEFA",
        "VariableId": "82a03e12-43f1-47cb-a8f1-2a5d62dd0ae9",
        "Identifiant5Min": "09272434-72c2-47cf-b76d-4416f48882d5",
        "Identifiant1h": "ca1f1ae2-e187-49d8-819c-cdceae50448f",
        "Identifiant4h": "01c1c7c9-93bb-425e-8246-d29dee843238",
        "Identifiant8h": "dcb046be-a711-4c06-a4eb-a49f683d4395",
        "Identifiant1day": "74a6386e-c98c-4ea3-842b-f369785e25b7"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_1241_1_TEFA",
        "VariableId": "651d0846-3b07-4674-8836-5db2957fe15d",
        "Identifiant5Min": "dad00779-c9b2-4066-a168-a0fe314af835",
        "Identifiant1h": "17ebe732-76ac-47ed-b57d-a19783df2a57",
        "Identifiant4h": "99097dc6-7654-44c3-806f-cf162c1d9d27",
        "Identifiant8h": "913ee514-fbb0-4dff-8e17-4b237273658b",
        "Identifiant1day": "23181cbf-7e35-4fb8-bae2-33f6672b9611"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_1241_1_TEFA",
        "VariableId": "37c0422f-5268-4f09-80b4-2ad38cc1bdea",
        "Identifiant5Min": "0e2b821d-382f-4094-ae54-f97607bc0d09",
        "Identifiant1h": "ca96a6cb-19f6-45a8-84ad-eaca2f4fbc12",
        "Identifiant4h": "f43b3966-eee7-4ad9-9b18-aa77f55850fa",
        "Identifiant8h": "1b03b386-c6a2-4f65-a293-70930286021b",
        "Identifiant1day": "89d98e2d-6b2e-441f-9e90-3339901a4005"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_1241_1_TEFA",
        "VariableId": "4d99fb15-2d0d-4f9e-acb4-27e6e8363aa9",
        "Identifiant5Min": "d6bc2e59-0db9-4c85-9b0b-2622a03459fc",
        "Identifiant1h": "744f00ea-729c-4b1c-ade2-1323299c8505",
        "Identifiant4h": "c55bbe25-c449-420a-9340-f98e627969e2",
        "Identifiant8h": "731616bf-6ffd-4da2-91eb-e84825029d1a",
        "Identifiant1day": "0cb8e579-9c35-4c59-bbc6-8294c074a534"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_1241_1_TEFA",
        "VariableId": "ca3f82b3-1fe2-49bc-88fd-8205ea15fe9f",
        "Identifiant5Min": "78581da3-c0fb-4e19-a4e6-8416babf295c",
        "Identifiant1h": "9a908ae6-75e8-4ec3-8cda-078b56616630",
        "Identifiant4h": "b49b51c2-a05c-4868-be27-30b515694d88",
        "Identifiant8h": "8c267c27-6ae1-4e80-9832-c353b037b247",
        "Identifiant1day": "90b68f95-e4c6-447b-a7b6-1521af8e3742"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_1241_1_TEFA",
        "VariableId": "02a610a5-3fdf-4c6e-9b9b-1133125f656d",
        "Identifiant5Min": "5fa31442-2b9e-4d6f-ab65-2bf6cbc29ec0",
        "Identifiant1h": "104f2112-d019-4714-bb87-a4c24ff84200",
        "Identifiant4h": "a274fc93-07ca-45af-b8ef-ff1175bce065",
        "Identifiant8h": "6a144c7d-bab9-4f2f-b00f-d436c9277da3",
        "Identifiant1day": "901b0b45-0277-4497-b96f-2448e89e78ee"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_1241_1_TEFA",
        "VariableId": "050cc107-678d-438f-8acc-5fb2131f9674",
        "Identifiant5Min": "bfba5ae1-07e0-41cb-af77-ede2b377bfbb",
        "Identifiant1h": "56916c52-68f7-41f9-a2d2-b357c6effe94",
        "Identifiant4h": "0f214c56-38d4-412e-9358-b59ca4adcdfd",
        "Identifiant8h": "4664767e-25a1-41b0-b473-b31fbe54b228",
        "Identifiant1day": "369628ea-703f-4016-abf8-80f2b3d1bd7f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_1241_1_TEFA",
        "VariableId": "af8e5796-c597-428a-b6c7-db8994da257d",
        "Identifiant5Min": "8e30b50d-7877-4e4e-a19f-799570e48fd2",
        "Identifiant1h": "b60e7958-f77d-49b1-97bd-2b8e12ec4430",
        "Identifiant4h": "f259e518-d7fd-41b0-b4a2-5fa22cbb73df",
        "Identifiant8h": "ed378ab3-de14-406a-91e4-3c39c3bc810f",
        "Identifiant1day": "a436fd19-0eca-4e4d-bb26-f962ead2e1fe"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_ROUES_LT4",
        "VariableId": "117f50b4-d755-4ba4-bcf1-09b8166454f4",
        "Identifiant5Min": "005a613d-8038-4819-9cad-f817fd752609",
        "Identifiant1h": "48407337-e66a-44a3-96e2-420f0c1a8568",
        "Identifiant4h": "d07d0d35-22b3-4b3a-af68-8cf8008f4ba9",
        "Identifiant8h": "bcf2571b-30f6-4f52-bc1f-e702b17fa661",
        "Identifiant1day": "bae1a74a-82ae-4b7e-8881-8a67591a58ec"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_ROUES_LT4",
        "VariableId": "757c2af6-36c5-48e3-bd1e-82a920fc751b",
        "Identifiant5Min": "085b3577-dc9d-4ac8-b51b-d9d1be0c7af7",
        "Identifiant1h": "f34bb8f3-e367-4154-a051-fe7a0a24c14e",
        "Identifiant4h": "228c80c6-8d68-4fe9-a81b-1394cfb1c23b",
        "Identifiant8h": "6d14acad-1e97-4995-aa1a-fa5713bbf7a0",
        "Identifiant1day": "3e26623f-a07e-440b-b6a2-7707e85f80bb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_ROUES_LT4",
        "VariableId": "c82dfce1-fc24-4e9e-8df5-7edc547cf2ea",
        "Identifiant5Min": "b5bf254f-ca85-4bb4-96da-3700235082f3",
        "Identifiant1h": "2aa6cc93-61fd-429a-ae69-7a84bdd6b624",
        "Identifiant4h": "88f31753-a991-4651-b0d2-7d10af98f05b",
        "Identifiant8h": "dac8d73e-501f-4044-a48a-2854d45f92cb",
        "Identifiant1day": "be83edce-65a6-499a-87e5-27aa0c2b1160"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_ROUES_LT4",
        "VariableId": "e2a6ff97-2c15-4f71-862f-455396b20c0f",
        "Identifiant5Min": "3ebcc7a1-36c5-44c3-9a3b-4a3cee98b444",
        "Identifiant1h": "f0bb276f-5b5d-4662-b168-d87df6ce999b",
        "Identifiant4h": "40c3b372-9ec5-4a1c-af62-a08360aadf84",
        "Identifiant8h": "c137d16c-bfeb-4d51-90d5-f5fb522ca26a",
        "Identifiant1day": "2e8313aa-7eea-431f-8ca9-19007b92a6c8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_ROUES_LT4",
        "VariableId": "673999bc-7b6b-4d20-9b4b-0b4e74b4cbe5",
        "Identifiant5Min": "c6cd8123-8d8e-46bf-957a-a14db0bebc21",
        "Identifiant1h": "9a8e548b-9d6e-4974-a285-671a09017cc9",
        "Identifiant4h": "c451813f-a731-4771-8576-19c1cfaebbd0",
        "Identifiant8h": "e2ae03b0-37fa-4f2b-a584-d6b10294bcfc",
        "Identifiant1day": "39c8cbe9-a34f-4fb3-b7fb-312081317375"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_ROUES_LT4",
        "VariableId": "93764353-b748-4b7d-99c6-7f422415b117",
        "Identifiant5Min": "c03973de-5987-4c4b-b8a1-6ec19465228d",
        "Identifiant1h": "9cfe15ac-ae0b-4c12-8301-e1e76428c8a3",
        "Identifiant4h": "cc5916a9-86cf-4294-a9b6-3ce0e6abe15f",
        "Identifiant8h": "9bac72c4-4286-4e24-b841-eb74502a137a",
        "Identifiant1day": "627d7ce0-ee07-48d5-b254-b2ee2aa698c4"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_ROUES_LT4",
        "VariableId": "8dc049d1-293c-44ec-b6c9-c7479bdcf6a5",
        "Identifiant5Min": "88268da9-fa24-4df4-aa22-d8daecf4e177",
        "Identifiant1h": "8f9f8991-590a-421d-af16-e3d9a0dbda42",
        "Identifiant4h": "4866cbf6-16d7-4e65-86e8-edbc0d983116",
        "Identifiant8h": "d2155265-b7a2-4b43-81ed-e0823d1cfa78",
        "Identifiant1day": "2da8aaa6-e9e5-4daf-932a-63821166f568"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_ROUES_LT4",
        "VariableId": "20f738f3-8ea8-46ab-b1d7-997ddf20e2c0",
        "Identifiant5Min": "80bfda0e-6ab5-4e0e-9cb0-e3bdac9c772a",
        "Identifiant1h": "61b0c48c-61d8-4fc1-8653-805bc94f99f3",
        "Identifiant4h": "2ffde707-1aba-4ed8-bf80-f1929d23b572",
        "Identifiant8h": "3248f9a9-d193-4b58-ab64-7a9b014d5ac6",
        "Identifiant1day": "6c2df3a9-bf42-4bb0-845e-39c6f2763714"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_ROUES_LT2",
        "VariableId": "89b2ea9f-0b6f-40ad-911c-4fadf4e17d51",
        "Identifiant5Min": "5bff9555-a721-45b4-bfe6-e3373e772142",
        "Identifiant1h": "b0bce21a-6721-4edf-809e-b51ede7c5f9e",
        "Identifiant4h": "920ea2de-d2bb-400d-b4a8-f73b8754e8a3",
        "Identifiant8h": "73d2cf00-0750-4057-b8f3-4ce32b65cd26",
        "Identifiant1day": "21677d2e-2ac8-44b1-ac95-6a17be5806a0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_ROUES_LT2",
        "VariableId": "b6d68f5b-8149-4657-943d-1ba5c4073265",
        "Identifiant5Min": "57cd4d87-84f9-4df1-a28f-ce2df2e5826f",
        "Identifiant1h": "8747f9d5-9285-4105-a25e-0a6d58cb2a32",
        "Identifiant4h": "f4775bbc-4c0e-4b1b-af6b-b5874a774fba",
        "Identifiant8h": "f855728c-0123-4380-bbe9-12d8ebc4651d",
        "Identifiant1day": "fe3cbb8e-8997-4068-8629-8df4eb308bd7"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_ROUES_LT2",
        "VariableId": "11646689-d096-4a42-9362-4b57de15bf51",
        "Identifiant5Min": "e1de27ed-5fdb-4788-b162-bf08b15ed2f5",
        "Identifiant1h": "230b65a7-b46e-45aa-b1e9-1dd1e2a979d5",
        "Identifiant4h": "423c7070-fe6f-44e6-997e-4d695cc4f9a3",
        "Identifiant8h": "3847cbfa-0e98-4c38-8678-49034490bc53",
        "Identifiant1day": "36a2372a-d072-4671-b994-a1a93e36fb49"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_ROUES_LT2",
        "VariableId": "44f1a764-5401-44e1-9865-9cf38f25f87b",
        "Identifiant5Min": "956c4781-19f8-4885-88cf-e6ca7816d5f7",
        "Identifiant1h": "0e4f15f1-77e3-4f36-9d3c-4afcff7a7021",
        "Identifiant4h": "0ed746f6-0180-4196-b996-e363313f89f3",
        "Identifiant8h": "4b72c01a-43db-49f4-bc33-a005bd6be6d8",
        "Identifiant1day": "cfd2840b-2f61-424d-b99a-7a493ed78f48"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_ROUES_LT2",
        "VariableId": "0824aeb7-1adb-41d4-8b8a-890dc054f895",
        "Identifiant5Min": "f56bfad3-5fbc-43d9-87f7-00964ad67977",
        "Identifiant1h": "da40012b-cdad-4c15-90d4-2903491be63b",
        "Identifiant4h": "6366e3c0-398e-4cdc-bb13-6e75ec21d490",
        "Identifiant8h": "4bfbd0e4-810b-4916-bc24-50a4eeb2c3eb",
        "Identifiant1day": "604f89f6-3bfe-469e-97d1-d0442e27c878"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_ROUES_LT2",
        "VariableId": "aab3154a-b832-422c-b09f-32480cddfe86",
        "Identifiant5Min": "97f1d467-46fb-40ae-beb7-08a227a1c25a",
        "Identifiant1h": "5cd774f6-afaf-4dd5-8f9d-aaa8c78343a7",
        "Identifiant4h": "7fd2636d-69fd-48bd-8c34-837a47a0e882",
        "Identifiant8h": "8d6548fa-1abf-432b-898e-05743a2f0d44",
        "Identifiant1day": "c6b539f9-f24c-415e-b536-428697e94cab"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_ROUES_LT2",
        "VariableId": "d12cdba0-c46a-464f-b720-232ef228860b",
        "Identifiant5Min": "263662f8-7d17-49c1-babc-282ad2c8a51a",
        "Identifiant1h": "ce23ebda-91e9-430a-92a1-1cf97c489445",
        "Identifiant4h": "25fa2f67-ed95-4ac9-b8da-42da2f625d17",
        "Identifiant8h": "19715349-2e7b-47e7-bc89-c5fd044d662a",
        "Identifiant1day": "294c97cd-8e94-4569-a163-13cc7e8d5d04"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_ROUES_LT2",
        "VariableId": "2e2057e2-ef3f-4719-86d4-c4de8b53939f",
        "Identifiant5Min": "212e6f02-aed5-4761-a309-086348dcc889",
        "Identifiant1h": "032723f5-103c-48ec-bb89-dc182deb569e",
        "Identifiant4h": "56f1e219-80b2-45a0-8fa6-b10b591af1aa",
        "Identifiant8h": "9de6f77b-47ff-49a9-b5cc-b7175a42aa2d",
        "Identifiant1day": "7148ab31-f822-4da7-a810-ea2ab9ff07f3"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_ROUES_LT3",
        "VariableId": "ef969b28-7d73-4f30-8210-1870a91bf987",
        "Identifiant5Min": "c74a9cbc-7fdb-4045-9202-9b694b6ad75a",
        "Identifiant1h": "d34c067b-9464-4d25-8232-0346f6a003ef",
        "Identifiant4h": "6e21fc19-19cc-4d1a-bc61-875435665392",
        "Identifiant8h": "a5e1e0d5-969d-4eca-9d39-60b9eb017ba0",
        "Identifiant1day": "1a870a85-2a20-4218-ae5c-2eb693d482fb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_ROUES_LT3",
        "VariableId": "61917827-4f71-40cb-bdeb-4d808fb73128",
        "Identifiant5Min": "15154e94-22c4-46d4-bb42-2ae94922a55c",
        "Identifiant1h": "37f74954-40e6-434c-b54f-412fdbfc24f5",
        "Identifiant4h": "69ec81c7-cd44-4097-867f-c6591e7551f9",
        "Identifiant8h": "2acab119-4a51-4351-9350-fe9c7c038757",
        "Identifiant1day": "6ac4e622-5b0c-4314-bc38-8d77b797b634"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_ROUES_LT3",
        "VariableId": "1f4e600a-e849-4cb1-adc4-88ee2f961074",
        "Identifiant5Min": "915d1f77-b53e-48ba-b21e-bc47622c05f7",
        "Identifiant1h": "b2243f23-68f8-4fd2-9f09-34433b9af501",
        "Identifiant4h": "1dfcd2ba-6642-46f3-800a-ce12c7f4be1c",
        "Identifiant8h": "b7dbc1f5-ffb7-4cce-9c67-1e63f25abb9a",
        "Identifiant1day": "5ce1af86-2687-4785-9cba-3c692c515ff1"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_ROUES_LT3",
        "VariableId": "7ed61ad8-51dc-448b-b8a3-9168be1b9d54",
        "Identifiant5Min": "c762f848-2008-45d1-ba9a-f735424cbb45",
        "Identifiant1h": "25470431-bbaa-441f-a7b0-373d8879ed07",
        "Identifiant4h": "ba0e6323-7edd-471c-a32d-fc71722f1085",
        "Identifiant8h": "3b32c47e-4ab3-4d74-8e71-93b5fd51b512",
        "Identifiant1day": "4ae73666-54eb-40a9-9b9e-649a789da7e2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_ROUES_LT3",
        "VariableId": "70b6cd08-7de5-47c3-9787-093653593af8",
        "Identifiant5Min": "ecd330c6-8f60-4f13-ad2e-f2e6364a24b7",
        "Identifiant1h": "1d102087-3cd0-4325-b5b4-9d6cef7d1cfe",
        "Identifiant4h": "0cbb9823-3c67-4dd1-bf69-652235d58843",
        "Identifiant8h": "f4a5302a-13a3-4cf8-9ed9-aeff0e22d4c8",
        "Identifiant1day": "8a19a1f2-659b-48d5-a9a7-7dc78b7fd6e3"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_ROUES_LT3",
        "VariableId": "fadb7a4b-d2de-466b-95d3-aa3297e07d82",
        "Identifiant5Min": "c20b3384-a86c-4a4a-be79-051293c4d013",
        "Identifiant1h": "dda14074-2423-4b2e-ae1e-83ecf18ef823",
        "Identifiant4h": "369b1656-f1fa-44b9-af1b-beefbc4daa9d",
        "Identifiant8h": "cdb9de3a-9c3b-4443-ae4a-dcae45650ce6",
        "Identifiant1day": "7127254c-12af-4aeb-89a0-e6afc08b84f0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_ROUES_LT3",
        "VariableId": "c71135de-147b-4faf-a032-051d1af345f0",
        "Identifiant5Min": "e928b921-dd3b-4762-86c9-48e4f9eee218",
        "Identifiant1h": "8e607b5c-7b8a-496b-b6c0-7cda0545688d",
        "Identifiant4h": "20019b21-9fa4-4342-b338-74bef31d7f75",
        "Identifiant8h": "9e0bb8cc-866b-41e0-9194-fb52ab954dcf",
        "Identifiant1day": "87d30898-027b-4dcd-a794-7061ba773e39"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_ROUES_LT3",
        "VariableId": "812e57f3-5603-4489-88b0-f3afaa82b3cc",
        "Identifiant5Min": "b0b5697b-9d6d-4c13-973d-adeb44653598",
        "Identifiant1h": "e3e56692-3978-4c5f-8dac-ac241fe4be3e",
        "Identifiant4h": "a1ee570e-00d1-4944-8c28-124f83061b9f",
        "Identifiant8h": "589ee4c9-dd52-4d9f-8f03-62b6779f7d7c",
        "Identifiant1day": "5d13d511-ed2b-40e2-8287-663546291e64"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_VIROLES_LT4",
        "VariableId": "2bd11598-f4ed-4902-850b-650544871f6d",
        "Identifiant5Min": "491ced6e-4f8d-4465-9483-28c6dfb4f1ec",
        "Identifiant1h": "8f9c84b2-729d-4400-bf0f-32aa14034135",
        "Identifiant4h": "405f1c59-b1b3-41f9-9a21-0c725bf13a0c",
        "Identifiant8h": "127e792a-7d9f-474b-81bc-834eef12a821",
        "Identifiant1day": "59c7973b-2151-46b4-9063-5254e6a3cb14"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_VIROLES_LT4",
        "VariableId": "75223508-5adc-41c7-8d28-7d69f242cb63",
        "Identifiant5Min": "09fda3bc-d3f5-415c-9fa3-9aabdea6a53a",
        "Identifiant1h": "ad05280f-7b66-4e91-be01-d763a9f7b3e1",
        "Identifiant4h": "6f4f224d-ed5b-4eb9-a7a1-6c33366a0f61",
        "Identifiant8h": "abf5bee8-c414-4e04-9dbd-5ecf97076b09",
        "Identifiant1day": "db06a6b4-1bae-4e2d-afd2-cdcdea1d1261"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_VIROLES_LT4",
        "VariableId": "70e07d9d-3b0b-4744-b220-ae919daea3dd",
        "Identifiant5Min": "340e1972-3e5c-4874-802b-814c70264b63",
        "Identifiant1h": "1ecfb374-5e47-4623-8f16-cb07f6c12f1e",
        "Identifiant4h": "00828f0e-235d-4e9e-9de0-3e9c14c1982f",
        "Identifiant8h": "372711a7-e9e6-4aec-a3ba-407480c3fd66",
        "Identifiant1day": "7045df97-639d-4766-9bdb-7165cba09b94"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_VIROLES_LT4",
        "VariableId": "981e3303-bbee-4a02-affc-7f2877f888ef",
        "Identifiant5Min": "ba5ed072-c88f-4743-b10e-e1925c680123",
        "Identifiant1h": "c0b183b9-7e10-4a5f-ad36-74022fd06185",
        "Identifiant4h": "2cc969f7-124e-4133-aae6-d81cc2475e31",
        "Identifiant8h": "3b231001-53ce-4ace-8a3b-9a8d5670c7b8",
        "Identifiant1day": "168f54ed-b14c-4a70-8e1c-09533fb39ab7"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_VIROLES_LT4",
        "VariableId": "b6d8411d-8e10-4829-859e-f4f824174a13",
        "Identifiant5Min": "9fa91375-1aff-4f92-abab-d8420b6933c3",
        "Identifiant1h": "9657cf54-45ca-4680-828e-912704d79c8b",
        "Identifiant4h": "7ec5f271-101a-4e50-99e6-bd3b7016e468",
        "Identifiant8h": "7e60748b-fae5-4332-8313-b7b183dadb1b",
        "Identifiant1day": "56658e2c-22a2-439b-847e-801bfb354558"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_VIROLES_LT4",
        "VariableId": "123527cc-cc87-47c0-ac5c-9e1537f84a68",
        "Identifiant5Min": "7390198c-edb0-4586-aed9-bbc9be66b01f",
        "Identifiant1h": "13816d7d-4886-4c97-bd36-db42996ef7e1",
        "Identifiant4h": "010a8371-8491-4cb5-aab6-65581e210e34",
        "Identifiant8h": "eea489d1-276c-4f71-9ebe-d3bf85904420",
        "Identifiant1day": "f6de41f2-2828-45dd-a4a4-c7fbade29771"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_VIROLES_LT4",
        "VariableId": "2d9fb645-9dcd-4ac4-9fa2-8259c4f8911e",
        "Identifiant5Min": "4baaa18a-d82c-4d0d-b981-aa2794f7b306",
        "Identifiant1h": "43ca0471-422c-4111-ab07-73be9ef452c5",
        "Identifiant4h": "85cd8884-d696-4ea3-b4de-31d3e3a2de1f",
        "Identifiant8h": "c01e8912-eb60-4415-915d-271299353bd3",
        "Identifiant1day": "760297b3-7fe3-4be8-8dad-cff093916500"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_VIROLES_LT4",
        "VariableId": "a7baae67-c144-4831-8e83-add6ff154c90",
        "Identifiant5Min": "64d51eb0-3973-4e8b-9292-76695654be1e",
        "Identifiant1h": "02c4c13a-9806-475c-9842-3a35c5308f44",
        "Identifiant4h": "4eabf51a-1e28-4b86-aae3-30f68c361a55",
        "Identifiant8h": "1201f265-18f1-4302-8672-db6fbe432c83",
        "Identifiant1day": "9c0250ce-38b4-4a8f-8a4b-0375fd73ff67"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_VIROLES_LT3",
        "VariableId": "569cc42d-0afc-4757-9b2e-f1a2c3aa77e5",
        "Identifiant5Min": "15bcc9b3-5b2a-4258-97a1-3b407d6b505b",
        "Identifiant1h": "5da14588-c8c0-4e37-8673-50def5835b3a",
        "Identifiant4h": "2b362eda-9dc5-4401-b947-c1bd00ca56ab",
        "Identifiant8h": "2954f1c8-3506-4581-a148-3d175691f088",
        "Identifiant1day": "9e0f98cd-da2f-4edb-bc9b-1a5cacc53be5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_VIROLES_LT3",
        "VariableId": "ef113644-e886-4144-b7e0-9961d427c1bf",
        "Identifiant5Min": "41938c49-c1e1-45b3-b919-41403623d8cd",
        "Identifiant1h": "97b980b5-93ed-409d-a050-f84935862038",
        "Identifiant4h": "ea46cf00-f397-4e6f-bd47-dffc6377ccc5",
        "Identifiant8h": "fb42f73c-42c5-4fc2-914e-a16fbd848b60",
        "Identifiant1day": "522e0051-9d17-477f-a1ce-1fe117cde211"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_VIROLES_LT3",
        "VariableId": "7efd1786-3320-41e9-9c2c-3276856d4025",
        "Identifiant5Min": "661fa526-72bf-47f9-a911-41d5cadacb08",
        "Identifiant1h": "5c9d5416-2d0d-41ab-957a-7cb76facac50",
        "Identifiant4h": "44ca01c6-7682-4655-a80b-c831a308810d",
        "Identifiant8h": "b19a9149-b25f-4a8d-8352-8687dee35c67",
        "Identifiant1day": "3439c237-52fb-4f90-b93f-1cb12397e82c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_VIROLES_LT3",
        "VariableId": "7f765253-e736-4ff0-8989-8aeed5ed91ec",
        "Identifiant5Min": "f16cfae1-64f0-4244-a57f-712e03bb11a8",
        "Identifiant1h": "49d4b41a-b47a-4297-8553-8c5e329df96b",
        "Identifiant4h": "d50bf9f5-fb0d-4fb2-86f1-ac78c740c355",
        "Identifiant8h": "4c094c83-37e0-414d-99a9-81c2e90756bf",
        "Identifiant1day": "cda08114-c97e-45f9-b0c6-df5e8f054afe"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_VIROLES_LT3",
        "VariableId": "d203fdf1-6817-4a83-ba77-955ddcf02873",
        "Identifiant5Min": "ecccf6ee-502b-4578-b1e0-8233d6e545e1",
        "Identifiant1h": "bbdd3ba7-0d2d-48c5-bee5-d45291865ff1",
        "Identifiant4h": "770a98ee-1dc7-4b11-9e57-ac13649ae99c",
        "Identifiant8h": "fb07f69e-734b-4acc-ab64-2e677a078705",
        "Identifiant1day": "e57cefb0-c90f-4e7d-b8ea-2e41eeb9f2e5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_VIROLES_LT3",
        "VariableId": "be429485-2f8f-4bf3-96c8-fa047d3a81dc",
        "Identifiant5Min": "621c5c06-1d83-4c2a-bcb4-bbfc9296f551",
        "Identifiant1h": "8f820b13-d453-4915-bd1c-d4ef89f6414f",
        "Identifiant4h": "ccd9babd-7e26-4978-ae05-150106532bb3",
        "Identifiant8h": "da0d1953-2b4e-4271-b81d-3c8d04bcebc7",
        "Identifiant1day": "81d31ea9-624b-4110-b855-447d7de44ddd"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_VIROLES_LT3",
        "VariableId": "1e3114d0-3316-486c-880f-3b5923cb56ec",
        "Identifiant5Min": "384f4785-b27a-4f8d-9507-91878aff93fd",
        "Identifiant1h": "3b8bda7d-a686-4ff6-b0fc-3c45c5d81ce0",
        "Identifiant4h": "df623e42-c119-4848-88c5-d9b9e01e3736",
        "Identifiant8h": "3d74f2c6-7902-4cc7-8d46-99c0f02f4908",
        "Identifiant1day": "f0678c1d-2f25-4775-be5c-efe4bc57f0ab"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_VIROLES_LT3",
        "VariableId": "c37c4f52-69b4-4f7f-84a2-c3873e0455f0",
        "Identifiant5Min": "5581eefb-6473-4227-ba4c-c33031ca99a2",
        "Identifiant1h": "87509fb3-e180-4cf6-8a3d-c34763c25a51",
        "Identifiant4h": "9e2ee850-1271-47c7-a565-4d6a6a5cff45",
        "Identifiant8h": "31a5b7b8-ec89-4148-977f-ad7e3a4b9558",
        "Identifiant1day": "4b8ff4e7-943d-4828-bb0e-beae8d959e93"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_VIROLES_LT2",
        "VariableId": "005b766d-4400-474a-98b8-b1155c2030e3",
        "Identifiant5Min": "cb9f1c9f-26a5-4b42-940a-ad04332ba7d4",
        "Identifiant1h": "0b359c6e-a501-452c-9f86-6aeae786f0e4",
        "Identifiant4h": "6869a6a8-d6fe-4bf9-9a4c-7e700ac93227",
        "Identifiant8h": "f2765e96-f958-4d76-867a-3918c748f4ab",
        "Identifiant1day": "e6f10ddb-e725-4ab4-8bbd-880dc2f45288"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_VIROLES_LT2",
        "VariableId": "bf63f1a4-eae8-497d-b672-e9b7b4563080",
        "Identifiant5Min": "ee6432c5-0126-4254-9c92-a3fa45103bd8",
        "Identifiant1h": "b61e3159-b67b-4960-bbe7-ae8976e59cc7",
        "Identifiant4h": "4a3d03bc-10c3-446a-af2f-6e131bfa6b12",
        "Identifiant8h": "a95f1be8-1187-4cbd-84ba-b53005c3a373",
        "Identifiant1day": "02b32427-052a-446f-aea5-c98dc7e4e3cf"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_VIROLES_LT2",
        "VariableId": "4981b66a-2977-46bb-97c5-e4815153d945",
        "Identifiant5Min": "e13b61e2-5b83-4b62-9f43-739bfd8f8355",
        "Identifiant1h": "c7823cca-1917-42c6-926f-9c21d763639d",
        "Identifiant4h": "cccce4af-67a0-4f7c-9a46-a006ca54c187",
        "Identifiant8h": "28049246-8353-408e-b5cb-5b63701319ac",
        "Identifiant1day": "d999171e-447d-42c3-afb5-5591c927e31c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_VIROLES_LT2",
        "VariableId": "b0bbcfd7-c466-405b-814e-a59868c640e2",
        "Identifiant5Min": "a6e0a548-77e4-4676-9d93-7a9360ca9dc6",
        "Identifiant1h": "eadbb7f2-2703-489e-beb0-cc0b0bd7fdba",
        "Identifiant4h": "9e77e927-7779-4866-be52-e859d0b43ec5",
        "Identifiant8h": "5a29f0be-4da1-416a-9054-eba38d06be4c",
        "Identifiant1day": "55522d26-8c26-403a-8906-6c816698e3a5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_VIROLES_LT2",
        "VariableId": "ad19ebe6-8f36-4dc5-9189-7380f9729917",
        "Identifiant5Min": "1087ce17-6063-4e8e-94b3-8c08b0d8d874",
        "Identifiant1h": "2b8c0e2c-7165-4865-b31b-2e4b39861b07",
        "Identifiant4h": "df66d5f4-4513-43ae-99de-09978b52735c",
        "Identifiant8h": "9734d967-8f7e-4f7a-93a2-65f98d50a0ec",
        "Identifiant1day": "d2254291-03de-4c35-a4f2-11144b20d41a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_VIROLES_LT2",
        "VariableId": "1e9f28ce-8edc-46a2-9623-76a269bbbd7a",
        "Identifiant5Min": "c130d2fa-81eb-4f89-81ae-04208dff0661",
        "Identifiant1h": "74080ce3-0587-4637-a7f5-e03ece4b370c",
        "Identifiant4h": "0f75c06c-11e2-47e9-a101-7d254562eb3a",
        "Identifiant8h": "f5647284-dfe7-4b22-bf3b-2224045bf3a5",
        "Identifiant1day": "cc210659-d93c-4d03-894c-15d88851b566"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_VIROLES_LT2",
        "VariableId": "8c70cb50-16d4-4f78-9474-0c0d88a1b9fa",
        "Identifiant5Min": "5c9fcac8-8b23-41b1-a9d9-d2c4d4798cbe",
        "Identifiant1h": "78505acb-f2b7-4b49-81dc-3287d754a4f8",
        "Identifiant4h": "86474579-06a4-4a5d-b8dc-4761f39be665",
        "Identifiant8h": "b7110a38-915b-4626-81a4-e2247b1466fd",
        "Identifiant1day": "5aed9e0e-19ec-4b5e-99d6-34e93b923d9e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_VIROLES_LT2",
        "VariableId": "e0aee8d1-45be-49c1-918a-5e504896b97b",
        "Identifiant5Min": "d4672727-9e2c-4256-bece-c4baa957400a",
        "Identifiant1h": "1b6c3ed1-9fd3-4fee-9e14-956742877e0e",
        "Identifiant4h": "533ea41a-3434-4280-a2b8-5ceb78325538",
        "Identifiant8h": "649c8515-c533-43da-9966-9ba19aba1d83",
        "Identifiant1day": "50e1170b-23d2-49e6-93a2-722f3230eab5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_TDS",
        "VariableId": "e8fb0a7b-f21c-4dce-a23f-791dba480eee",
        "Identifiant5Min": "b1551c87-ade6-4d20-9de7-c9628cf5e0a7",
        "Identifiant1h": "bb960eca-2afb-4b8c-ae0f-df3b11e2074b",
        "Identifiant4h": "8262fff5-8e60-4088-bd1b-c0c7bf5fd643",
        "Identifiant8h": "a43660c6-82c5-435d-a137-5c96de2a0fd3",
        "Identifiant1day": "b29c41d2-1ab1-4b80-bc4a-e1b2c727b3c1"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_TDS",
        "VariableId": "13091e1e-bf75-4047-a635-d869b42e9a1c",
        "Identifiant5Min": "125509c6-f631-4128-aefd-7daf14255a3f",
        "Identifiant1h": "f7fa2054-2934-4034-9e01-8f8a6f1b5a15",
        "Identifiant4h": "6ef816fc-89f1-4562-b806-2f1c8615522d",
        "Identifiant8h": "7aac1fec-b426-47ce-a72a-018a4af53d38",
        "Identifiant1day": "0b87ff2d-457e-41d8-bca9-ded1140b944b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_TDS",
        "VariableId": "cbb7a158-2f25-4eb1-96ca-7ce540ab5c0a",
        "Identifiant5Min": "1f0dc78d-051f-4d05-be81-e300425fe4d2",
        "Identifiant1h": "d17bd046-50d9-46d6-80c4-7e3ada211a6b",
        "Identifiant4h": "77ee75d7-98d2-495c-a364-0ec3d9ef578e",
        "Identifiant8h": "2a085021-b75e-4900-891b-a828e825e76d",
        "Identifiant1day": "499529d9-14e3-4c0d-9425-213d232c949f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_TDS",
        "VariableId": "578ba42d-a92f-43df-ac44-a42ebcc9f080",
        "Identifiant5Min": "3df1977b-6646-48c3-8a81-12346db1b37a",
        "Identifiant1h": "d429a129-b46f-42fe-b6c4-9c4781dc7fe8",
        "Identifiant4h": "008e0401-dc53-4ec8-8b37-a6a958afbcd1",
        "Identifiant8h": "a1dc5c60-56bd-4bce-93e1-f830fddade2f",
        "Identifiant1day": "1773934a-116d-4390-8ba8-31cff4b30572"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_TDS",
        "VariableId": "87490348-c054-4bc2-b07f-854f1f19edf7",
        "Identifiant5Min": "b56e625d-3f58-489d-b168-7a1c5a74f8b2",
        "Identifiant1h": "04708b71-dcca-41e5-9798-75e86a0a188c",
        "Identifiant4h": "6d57c235-981d-49b8-ba9f-fdf5c533776e",
        "Identifiant8h": "7f90f61a-b68e-40f3-b16e-991904ebb64c",
        "Identifiant1day": "800697ea-a957-46b2-9a11-3e1ba883d242"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_TDS",
        "VariableId": "54d2ffe8-917e-4a00-8c94-2e4f4bb8bcd7",
        "Identifiant5Min": "e6b8dbc7-cdbd-4a95-9254-792779513697",
        "Identifiant1h": "4bc7899d-3c19-4a80-ad4d-d116349b5769",
        "Identifiant4h": "35532170-0775-42c7-a438-584ec1737220",
        "Identifiant8h": "63e0b4c5-3b00-47b1-b9db-91f7f76bcd97",
        "Identifiant1day": "1cc584ad-d46f-4e7f-9172-e0c2b9571838"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_TDS",
        "VariableId": "2904b197-da58-4f78-887b-c41dae25c4ee",
        "Identifiant5Min": "8ad86681-55f8-4a8a-b6e6-50420e320958",
        "Identifiant1h": "67ed6336-272f-4a78-acd5-f44f1d727ef8",
        "Identifiant4h": "5536c5f1-8c66-47db-bcf4-e36f5540f551",
        "Identifiant8h": "c2438728-934a-424c-9f77-a7bed3331a01",
        "Identifiant1day": "7a59b248-ddde-42ee-8782-bf82d651294e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_TDS",
        "VariableId": "28018cee-e36c-4ffd-ae3b-1dd6c85641d0",
        "Identifiant5Min": "d61121e0-9c20-4d0a-809b-f2e2b88d91df",
        "Identifiant1h": "c6fe6b2c-86f9-435f-b00a-3d5bfbdaac71",
        "Identifiant4h": "c089635a-7cff-4d01-9f8a-c6dc0a851910",
        "Identifiant8h": "fd87208d-a2b1-48fc-aea5-e5d5a0609e1b",
        "Identifiant1day": "1277eea9-f97c-4ff6-81a0-e3125b14f13d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_NSA",
        "VariableId": "8722b3ba-ddb7-4af8-86fe-554fefdabe53",
        "Identifiant5Min": "4215055c-d42e-4a60-9cca-6745deb9969c",
        "Identifiant1h": "1a93b287-590c-44f8-b41d-b9261ec5e496",
        "Identifiant4h": "e68ea174-835b-44d0-a081-cc68a7ab7eed",
        "Identifiant8h": "d1a0300a-d46c-4250-b01d-308f64f8b0c2",
        "Identifiant1day": "0886743a-4e06-4ae3-b1f4-90b605ab12ba"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_NSA",
        "VariableId": "e404bff4-9810-470c-9d6e-f056fc65fa84",
        "Identifiant5Min": "61668d91-67cc-48e7-ba01-188647c88be5",
        "Identifiant1h": "76dffa95-49e6-4a9f-9e06-aebc3cbd6edc",
        "Identifiant4h": "071e0d67-6f62-4b8f-947f-8da5d6f18c3f",
        "Identifiant8h": "ee64aa75-5de2-42f8-abc3-7f348fc2a5c9",
        "Identifiant1day": "6b16d164-fbd4-452d-b60f-0a24cb9b3824"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_NSA",
        "VariableId": "6ab78d1d-2962-4a94-98f3-a790f7568d67",
        "Identifiant5Min": "56b92aa5-ea30-45a7-be78-5e3ac537412b",
        "Identifiant1h": "62b8fa89-6c8e-4ef5-853c-a74bca109ec8",
        "Identifiant4h": "6e83d773-1828-413b-8ca7-7b649459511c",
        "Identifiant8h": "88d4a96a-fbfd-4422-ad50-21f9233bfb45",
        "Identifiant1day": "12e416eb-cf60-4cc8-89bd-8024b24b11c9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_NSA",
        "VariableId": "dabc0820-6eb8-4c58-8eea-6353fcbc1148",
        "Identifiant5Min": "d759c20c-fc90-4c51-a208-513238413682",
        "Identifiant1h": "292a6012-56ee-4063-8f24-a8b4091d98b1",
        "Identifiant4h": "9b91d763-e416-4d0a-a2c5-abdc952dc745",
        "Identifiant8h": "8e6c0fca-c6c3-4eeb-b365-251239a4ae38",
        "Identifiant1day": "a07b9a57-dda9-4be0-b77b-b22ad60d5e5b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_NSA",
        "VariableId": "cc6a0c52-4188-490f-8117-51773d902d2d",
        "Identifiant5Min": "a1b91888-ba33-41dd-9193-fa3666b3adf9",
        "Identifiant1h": "98cd5d76-6533-42c6-b833-27f59b8155c5",
        "Identifiant4h": "e850d9fb-7d1b-4f56-9197-b6d3a4809257",
        "Identifiant8h": "ce46a583-ed70-4972-b2a9-4414898ffd02",
        "Identifiant1day": "a314fe48-55c1-4d03-8c3b-39dceb0e7c35"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_NSA",
        "VariableId": "90eb91bc-6828-4fa9-95e1-799174e5f019",
        "Identifiant5Min": "aada04ae-d547-47c0-8883-23e802339932",
        "Identifiant1h": "f10911a2-6ffc-44e4-a46a-b59da9e77912",
        "Identifiant4h": "8ec09dfa-2a3b-4635-9251-8ded671990d2",
        "Identifiant8h": "5843d00d-7a49-4712-947c-4d66c43fc46e",
        "Identifiant1day": "c0cc00e2-8556-4473-b6df-b14395d7237f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_NSA",
        "VariableId": "1d8b4fed-1100-4e83-b076-886018f9884d",
        "Identifiant5Min": "32613823-82ee-4b78-9bab-de030a1db7ed",
        "Identifiant1h": "af0b452c-0c79-4c8b-aafb-150a611eeff8",
        "Identifiant4h": "dd292c51-327c-4ff6-af09-0fa0dc8a86c0",
        "Identifiant8h": "e7ff0529-c8ea-4438-b610-427c8012ac07",
        "Identifiant1day": "3998758c-9ab6-407f-9c4d-19ae020847a4"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_NSA",
        "VariableId": "d06ecf6d-7c87-4a2a-a31d-6b8764f3224a",
        "Identifiant5Min": "4d12a7c5-f5bf-4eed-ab3f-d6bfb4179d0c",
        "Identifiant1h": "8776cb68-d4d1-4825-b425-df52b553497c",
        "Identifiant4h": "ec5d0c44-8542-464a-b570-460ecb672508",
        "Identifiant8h": "932bea5b-1aec-489d-b5c9-9f1fb835240c",
        "Identifiant1day": "a659245d-5ba2-45aa-aca2-469bab976d44"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_PPM3",
        "VariableId": "894c466b-9fff-42d0-bfa9-f2e532f4971a",
        "Identifiant5Min": "793d3926-0711-4ae5-a4a6-9f38a846ebfc",
        "Identifiant1h": "36494d7e-82ee-4160-adb0-fd88d6bc832d",
        "Identifiant4h": "bbe71447-9026-4949-a3fe-b7c0fd830540",
        "Identifiant8h": "6395fa77-baed-4443-97ea-de722153b3c7",
        "Identifiant1day": "dc77bdd6-d65c-40f4-8140-ff4530046978"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_PPM3",
        "VariableId": "3b73c78e-7193-4b2f-9f53-a73712baf451",
        "Identifiant5Min": "dee7070c-375f-47a8-a00f-75d895e2c3b8",
        "Identifiant1h": "9bc47291-7abe-4cbb-b808-fa8ce65ba11b",
        "Identifiant4h": "4fc4843f-df31-456c-ba96-4f86b254e1c2",
        "Identifiant8h": "389bf160-e8f8-4960-a0cd-be9b22011e6b",
        "Identifiant1day": "90c1caef-af82-49a3-9292-7a4504a6e477"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_PPM3",
        "VariableId": "ddd207eb-be88-43ab-b636-fc1eb63a2bdf",
        "Identifiant5Min": "48426ea4-1907-4108-b8a7-a6726e9c360c",
        "Identifiant1h": "0f68c7d1-0346-4ceb-a05f-6a1907f326ac",
        "Identifiant4h": "f7b23d46-01e1-419a-b3a4-7d1b7cfdd6b2",
        "Identifiant8h": "d0efe41c-c8ac-4a1e-8f0a-49e30abe68fe",
        "Identifiant1day": "7d95cd71-b7d9-4223-b680-3245b88313d9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_PPM3",
        "VariableId": "a4ee039e-d1ba-4adc-b6ce-006c712ba673",
        "Identifiant5Min": "edf0c7d9-328b-40be-a4fd-763113e7775d",
        "Identifiant1h": "72b6e833-e91d-4035-8632-c02721fe475b",
        "Identifiant4h": "bfca76a0-3198-461f-a35d-4e7daaf76181",
        "Identifiant8h": "56a7104f-3182-4718-b46b-26c548f766da",
        "Identifiant1day": "7dac55e8-5526-4807-8166-ef0e1b2a6ba5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_PPM3",
        "VariableId": "a339edb6-17e2-4a13-afa1-568366b75912",
        "Identifiant5Min": "e75fc5d0-0d0f-4537-ade9-6da50dee8ed0",
        "Identifiant1h": "3e85d3c2-3ce5-4065-8e6e-0f17e9532098",
        "Identifiant4h": "a690e728-99b5-4a2a-9fe7-85eb7d5e8ec0",
        "Identifiant8h": "ac239143-d84a-457b-bf0a-e399c13fbb4c",
        "Identifiant1day": "9b53f697-4f05-4d03-b146-bf00fb65215d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_PPM3",
        "VariableId": "7a76f752-b6e3-4a75-86e1-3ef0102b0b2b",
        "Identifiant5Min": "a61aa680-12f3-4450-ac8e-bb63b255ff33",
        "Identifiant1h": "24149a00-db2d-4e44-a406-0cdc2f75651b",
        "Identifiant4h": "5036311a-8f27-4998-8f8b-8d722432a208",
        "Identifiant8h": "12d62112-ecd6-4741-80d2-e6361205ead6",
        "Identifiant1day": "b8d8f038-7767-4223-91a8-ce37d3763d61"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_PPM3",
        "VariableId": "468a8941-d583-4ff4-ae90-98c6827bced9",
        "Identifiant5Min": "45d5c7d1-0551-466f-baa3-f9eba5ec3790",
        "Identifiant1h": "b7cb6843-9051-46e7-ad2f-adbc88629810",
        "Identifiant4h": "144de845-1822-4e1d-a65b-f7a73514bd84",
        "Identifiant8h": "45e35469-9400-4342-9e15-6f55073c2d65",
        "Identifiant1day": "b2823c6f-b9b2-4919-9962-00d065c3f06c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_PPM3",
        "VariableId": "1a53a43a-3c0a-4393-a57e-928e0415dfc5",
        "Identifiant5Min": "4fdeacab-7408-46f0-b377-6b3c5dfab246",
        "Identifiant1h": "0f76e0a5-1a1f-48b1-aca4-e06cdc6a5245",
        "Identifiant4h": "05349495-04af-45fd-b60c-ab490d542956",
        "Identifiant8h": "656c69e8-1a78-4e43-bef5-2771e2248c01",
        "Identifiant1day": "d9d87479-0c0f-4383-bd06-4af008b91c9c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_JANTES_LT2",
        "VariableId": "9a54fcd2-565b-4aad-9e48-480f8c1a1991",
        "Identifiant5Min": "9c3f6356-6124-4a5f-9446-b6d50ea5448b",
        "Identifiant1h": "77d0150d-1e7f-479e-be31-0e4b5dc19cc2",
        "Identifiant4h": "0b0bb99b-8e7a-489d-aff4-781a348a7e03",
        "Identifiant8h": "81e802d7-e0ca-4549-8938-b2f0b5449cbd",
        "Identifiant1day": "d68a2bf2-8152-4ee8-9c6e-bcfe9828c712"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_JANTES_LT2",
        "VariableId": "5ea98917-b698-4235-b2d7-e5c8f3fd01c8",
        "Identifiant5Min": "d1a18028-bf3d-4096-82b6-79b5f9b78f5c",
        "Identifiant1h": "c73848bb-46bc-438c-8f8e-fe9575ea7376",
        "Identifiant4h": "12a65a6e-7d3e-4146-b004-c38072d7ad41",
        "Identifiant8h": "d22880bf-8a60-40fd-8229-a14891332903",
        "Identifiant1day": "c8507f3c-2bab-4f19-a30c-a320d6c03771"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_JANTES_LT2",
        "VariableId": "f1088e88-3eaf-4a22-bb92-22f736063e06",
        "Identifiant5Min": "3416dc89-dfa0-4484-a059-fd39af6f7c57",
        "Identifiant1h": "e7e6e9e7-6d90-4c8e-b52b-e3ac3c1dd916",
        "Identifiant4h": "4261e8c4-8f61-44e1-bb25-955778755cef",
        "Identifiant8h": "dc81110f-a80a-49c8-b814-beadd87210d5",
        "Identifiant1day": "1cd61172-6d18-43e0-a354-44a6789a4219"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_JANTES_LT2",
        "VariableId": "ada0dd88-a8a5-4dce-8c6d-0629ff08093c",
        "Identifiant5Min": "c3eb3305-19b3-4025-bfc7-576ee1ece5e8",
        "Identifiant1h": "ee5769b9-bbac-4b7e-bf1b-20581ee3f00a",
        "Identifiant4h": "1f341d44-5d70-4bbc-850b-4c8e85ca49e3",
        "Identifiant8h": "3a47bf4b-6207-4e53-b085-b73543566f0b",
        "Identifiant1day": "4fbe81a7-49b5-41fd-9ddc-acb310d0aa29"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_JANTES_LT2",
        "VariableId": "3c2c2c2a-8009-4519-bc7c-794b94232184",
        "Identifiant5Min": "f5724e55-9f38-4af7-af57-4a4926ffee98",
        "Identifiant1h": "65cc8d1d-6de1-4a5c-acf8-006b658818ad",
        "Identifiant4h": "a32edb80-5aff-4c3d-8e9c-33a26ad863fc",
        "Identifiant8h": "0bb872c4-6b8b-4a24-b466-5d3f49b66ba8",
        "Identifiant1day": "5d8511e5-378d-46b0-93e3-4e1ccb9b953b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_JANTES_LT2",
        "VariableId": "bf4363d3-e4ff-4528-9b0b-edb8ed0ccc0a",
        "Identifiant5Min": "f7b2e41f-3fc2-4266-82c2-18ce1f560a18",
        "Identifiant1h": "1a3c0362-2fc1-4d9f-b3b3-f72068632796",
        "Identifiant4h": "93e30dd3-1c43-4b11-a14b-d0cbfd0d25c9",
        "Identifiant8h": "b5b1b70b-f49c-445f-b7e2-5344c4a2b446",
        "Identifiant1day": "767d620f-d88e-41f0-a46a-d637f270127c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_JANTES_LT2",
        "VariableId": "54a806a8-9eb7-4b44-9e54-03c92026c762",
        "Identifiant5Min": "c052e86d-3575-4932-8071-ac8336af438b",
        "Identifiant1h": "60965fdd-44b7-462d-a1d0-09c5736e4f6b",
        "Identifiant4h": "3ab189be-b118-486f-ae29-d9b1bf6499cc",
        "Identifiant8h": "6ba0f12d-0d37-4255-9947-404adb2cf29e",
        "Identifiant1day": "70e1db85-4c5a-4b99-a792-fb5b1d97e38e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_JANTES_LT2",
        "VariableId": "5bf28900-f50a-4ce0-8088-1cd891e91601",
        "Identifiant5Min": "688bd1da-9da4-41ad-aa1e-212e17b384c7",
        "Identifiant1h": "344ccb2e-1d35-47fb-9e7e-af549fd3b289",
        "Identifiant4h": "71e5e4a7-832e-43ff-8908-363bda5e5db1",
        "Identifiant8h": "513938da-13cb-4641-b894-6ce59204425a",
        "Identifiant1day": "337516ed-274f-4b6f-b0da-fc313644e5a6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_JANTES_LT4",
        "VariableId": "d970aaad-db3d-4e2f-b75c-da57487a2424",
        "Identifiant5Min": "dbb5df43-354a-4ef6-8971-27943feb3726",
        "Identifiant1h": "fc5f59dc-f260-4191-aa9c-e74ca2c4b164",
        "Identifiant4h": "40c76bba-b307-4fa9-95ec-64b73e619e83",
        "Identifiant8h": "ff71a355-43e2-4ba4-87ff-c4e04e2c5fa2",
        "Identifiant1day": "a92c7a7e-77f5-4fee-9d41-d52149098e82"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_JANTES_LT4",
        "VariableId": "5e53c326-dc53-4be2-a8d4-2428861efa71",
        "Identifiant5Min": "7cc4c95c-8acb-498b-b679-2fa49bd20d27",
        "Identifiant1h": "a85a8948-ace3-4aa1-b1d7-ecc2a6443c44",
        "Identifiant4h": "38611bee-725d-4db0-a235-c7e986ea6bff",
        "Identifiant8h": "0a8881c2-76fb-4f95-850e-f5b3da03f3ac",
        "Identifiant1day": "de7ab13e-2c08-492d-90e9-6e56515b5e21"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_JANTES_LT4",
        "VariableId": "ed9ec7ce-c1ea-4558-b389-141936bf909a",
        "Identifiant5Min": "20d76917-7e4e-4fbd-83ba-f2d226ae0e14",
        "Identifiant1h": "a8cac1aa-0f21-45d8-8833-a3c365147504",
        "Identifiant4h": "12a4cd8b-aa67-40f5-8274-3f1a36e5bccc",
        "Identifiant8h": "4f635b62-5312-4908-b181-b1aa6dbd796f",
        "Identifiant1day": "4f3e8208-fd15-4653-94d7-08c2abc8ed04"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_JANTES_LT4",
        "VariableId": "eddea7f9-64a5-4e37-a2e4-3c9164524ef0",
        "Identifiant5Min": "77377ea4-030f-4667-9377-e614a8050d74",
        "Identifiant1h": "37c43f0f-2697-48e6-a9cf-bc770f7d3fc0",
        "Identifiant4h": "ea8148e6-3531-4a6c-a49a-26c87b8c8451",
        "Identifiant8h": "adc85fe3-cb85-47e4-902f-7a8ef066f9c6",
        "Identifiant1day": "ce0b0821-3a30-4864-a564-136a33dc34fe"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_JANTES_LT4",
        "VariableId": "0a7cc286-e136-4a82-89ee-cebce1df5d8b",
        "Identifiant5Min": "c4b62640-02b5-45bb-9202-92f9a5f71688",
        "Identifiant1h": "c5003955-0459-47c8-ba69-d47084d65ca0",
        "Identifiant4h": "67152b6b-67f5-4d82-a16d-a1fd878d0cc2",
        "Identifiant8h": "c818ed84-ca4a-4f56-89e6-39625d13784a",
        "Identifiant1day": "aa37e4ec-bb59-4bf9-ba94-1e1467dd19cb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_JANTES_LT4",
        "VariableId": "ec5811c1-e2a3-4135-8c9f-674e413916c8",
        "Identifiant5Min": "c63addfe-6fa8-4ee2-90bc-0ddd99e7169d",
        "Identifiant1h": "9806f0f5-e0d8-44b4-8301-4b148bcf2db9",
        "Identifiant4h": "0a010b37-5be8-413f-b411-cf1c88947723",
        "Identifiant8h": "83ee7864-1c82-4e59-8cad-5955a27091ea",
        "Identifiant1day": "05749c46-96e0-41fd-8934-ec70e6bb9f2a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_JANTES_LT4",
        "VariableId": "2e5c985e-4ce7-4b33-aab0-8bd896800c02",
        "Identifiant5Min": "e38aa5ea-b0a5-4989-ade5-c4930635180b",
        "Identifiant1h": "cc942fcb-1777-4c97-ab7c-5f90a7dcf58d",
        "Identifiant4h": "bdac4634-3fd2-4eca-9202-ea6da476bd49",
        "Identifiant8h": "06c83a08-d6ab-4d6e-8288-9b9cef8d627f",
        "Identifiant1day": "9903b27c-976c-4638-8e40-b3f8bf46e7bd"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_JANTES_LT4",
        "VariableId": "abd1414f-b341-47a2-bd9b-95ae10919d2e",
        "Identifiant5Min": "eb86389b-1a97-458f-bd5e-a054e893a8ab",
        "Identifiant1h": "dfb42391-f06f-400d-89ae-3998e953fef7",
        "Identifiant4h": "4b1f8f79-8d71-4405-abae-8ad11e0960fd",
        "Identifiant8h": "1fbbda69-4568-45ab-a75d-1ae7bcb06034",
        "Identifiant1day": "087f4149-7967-4fb7-a0f5-d74e9eddb902"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_TDE",
        "VariableId": "6778869f-370f-41e4-bf7b-ef78ed9854d1",
        "Identifiant5Min": "09581bf7-6d59-4d81-8b41-706d36507dc9",
        "Identifiant1h": "f31bf266-1e40-408e-be34-8c4c82d4edc9",
        "Identifiant4h": "639549dd-dddf-4958-a916-45ad89c0f675",
        "Identifiant8h": "21ff6172-51b2-4ca7-a7be-b9e427d15121",
        "Identifiant1day": "26c3217d-55f8-4882-946f-f5dd3268cbec"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_TDE",
        "VariableId": "20293a0f-82c4-427b-919e-a95bdd6c00ae",
        "Identifiant5Min": "3c152354-e6aa-4134-891b-d315acf3514d",
        "Identifiant1h": "28d5aa80-98cc-42c5-9bb8-de2c4248a714",
        "Identifiant4h": "87c74a55-96a5-4632-8d24-713087613e98",
        "Identifiant8h": "8c290ae3-2b9f-4e4e-899a-c339d159a801",
        "Identifiant1day": "caff846b-221c-49c3-8347-e55c85cd76a0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_TDE",
        "VariableId": "2f7de391-8a65-4325-aa4f-0bd02445e17b",
        "Identifiant5Min": "051cc5ff-cd16-4872-bc17-99ca080fac52",
        "Identifiant1h": "b9af6ef3-04eb-44e3-889d-b294525e1680",
        "Identifiant4h": "4e3e494c-1849-458b-b291-3ec215c1cbc6",
        "Identifiant8h": "b1dcca8b-82b2-4d58-9e47-e14499af935e",
        "Identifiant1day": "1c1abb78-faab-4673-90eb-4df5395d9d22"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_TDE",
        "VariableId": "c8b18dcc-7a44-44b6-bd18-9c7543fba8a3",
        "Identifiant5Min": "81dc8ed0-5c96-4666-b89f-c23fb87470ec",
        "Identifiant1h": "1a65e400-73cc-4a39-b98d-1f6a835991a6",
        "Identifiant4h": "1f35a5be-62cd-470c-9c21-db27bb3c21e3",
        "Identifiant8h": "9c2f6ad3-6ffb-4404-9be4-37e971c65888",
        "Identifiant1day": "123255da-def5-4045-91a7-8e4debaffa10"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_TDE",
        "VariableId": "9a02bbde-ae05-4762-9359-a7df7441d4ca",
        "Identifiant5Min": "4e89d810-21b2-42ee-a79c-0a6501c2aae7",
        "Identifiant1h": "eb30c942-6a97-45ce-bf8d-7f924cabcc6f",
        "Identifiant4h": "ddcbdd10-c499-4555-8851-189b8f856ed1",
        "Identifiant8h": "7d1cf1c0-48c3-4bc1-9056-8db9a8ef39e4",
        "Identifiant1day": "7fd841c4-318f-4791-956a-cfeaf627749f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_TDE",
        "VariableId": "8b5f90e5-9a2d-47b7-ad51-41e66129fef6",
        "Identifiant5Min": "8f0303cd-480b-49f0-afdb-fd89dcba2eb3",
        "Identifiant1h": "9c168c77-f2dc-473c-95ec-0a6ab5ee6813",
        "Identifiant4h": "49c0139f-5e1e-4e8a-a81a-e5d4a57c43eb",
        "Identifiant8h": "849d68e6-f4c2-4706-85fa-2a12cb65de37",
        "Identifiant1day": "9afd2d5c-eeeb-4bc3-91c5-a086bf673bed"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_TDE",
        "VariableId": "a637b4b6-b73c-4781-a3c5-2f89ceb817f9",
        "Identifiant5Min": "604964da-00b4-4b42-b73b-7af0061dd9f7",
        "Identifiant1h": "d310c25b-7e0a-4460-822f-f05d8ebfcd48",
        "Identifiant4h": "812aea95-2d60-4c2c-9955-bcbf7f26b508",
        "Identifiant8h": "78739c9c-7615-458a-8eac-c29a1d7a51e8",
        "Identifiant1day": "547832d8-4fcd-42bd-b697-fca0ce8c30a0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_TDE",
        "VariableId": "09115503-16dc-4cf9-83d0-b299b7fa28cf",
        "Identifiant5Min": "08a00e03-8f1c-4900-83fa-eb98f9f1b953",
        "Identifiant1h": "fdb3a14a-0706-43e6-9f5a-d078f440b214",
        "Identifiant4h": "2709c116-2cbe-4c74-af06-75d295626f21",
        "Identifiant8h": "f67548d9-1ef4-49d9-ab43-f43845fc7075",
        "Identifiant1day": "53e43c79-173f-492e-a884-7831d1571411"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_SdM",
        "VariableId": "c40daa47-8cfb-4f18-bb29-bfbc60c65332",
        "Identifiant5Min": "33412cb0-5105-4a29-a4dc-a9e7e31894c8",
        "Identifiant1h": "7c5a5595-91f0-4220-9b57-047a17d239e8",
        "Identifiant4h": "7445bdce-762e-4804-97ce-147528ecb262",
        "Identifiant8h": "35f1217b-f70c-40f7-b98a-f911f3a2fb92",
        "Identifiant1day": "5e07c763-0b5a-4ac6-af3a-4aae356f3d24"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_SdM",
        "VariableId": "62e5cbee-d14c-4336-927b-e16e4a359c5e",
        "Identifiant5Min": "e796bca7-a0cf-4b35-a2e7-c1b43e22fbe2",
        "Identifiant1h": "c876b373-5bf7-4d9b-ad3d-62cdba5980cf",
        "Identifiant4h": "549ad249-0d25-4e6c-9572-378b365406b5",
        "Identifiant8h": "f3354ca8-ce54-47b9-86c9-f2a3216d4577",
        "Identifiant1day": "540f5313-91bf-462e-9f73-b69b281c7f16"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_SdM",
        "VariableId": "73f32509-fb69-41eb-ab8f-9f4b7f859dd8",
        "Identifiant5Min": "ea61f0f5-99c3-4efa-acfe-5fb7d8b8f35a",
        "Identifiant1h": "9e6272ad-fb4a-4127-9d08-98204684d32d",
        "Identifiant4h": "e6caa69a-235a-497a-8a33-2f25c97df0c1",
        "Identifiant8h": "1dc1a4df-bf21-4691-b4d8-1effd428bf31",
        "Identifiant1day": "edfe1e5a-f63b-4b23-b213-f0c8285b89bf"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_SdM",
        "VariableId": "e66236ec-a6c3-4f18-bc4f-59c3831eb6f5",
        "Identifiant5Min": "6ee890e3-65cf-4863-b45b-7f84ed591286",
        "Identifiant1h": "7280c863-7164-48fc-a03a-02fdd737fdc8",
        "Identifiant4h": "f47e09c1-83e8-466e-b775-e33ff7056420",
        "Identifiant8h": "fbb3bc6b-e872-46a0-8aa0-5e82ddb9ec80",
        "Identifiant1day": "ad0b0047-ac03-4989-94fe-019e11334aa4"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_SdM",
        "VariableId": "2404761f-f30c-48cf-ba67-135214a42459",
        "Identifiant5Min": "73048cfb-e5cc-4677-a844-befca484b5bb",
        "Identifiant1h": "fdbfee08-2757-433c-8112-ff8847f821c7",
        "Identifiant4h": "c3d8d7e3-cdd8-4f71-9f65-bc2f48e13df0",
        "Identifiant8h": "c6161923-e382-400d-b8c9-4858269ad64b",
        "Identifiant1day": "2fd9fb92-471e-40cd-b567-5c1ff81d384f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_SdM",
        "VariableId": "0c890250-da76-4be6-8b16-cada597ae0c6",
        "Identifiant5Min": "56573253-eb20-4929-906f-622dca02ea33",
        "Identifiant1h": "eb077aff-e865-4984-9631-237acbf58757",
        "Identifiant4h": "dfa07b49-7413-483d-8361-72111f16dc02",
        "Identifiant8h": "fd6a3e47-c546-45f6-b047-ebbdacd63c35",
        "Identifiant1day": "69a962cf-3a23-4345-a09b-fc6e141b46a9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_SdM",
        "VariableId": "a27e6688-a8da-4292-be50-731ed7b9a28e",
        "Identifiant5Min": "2f65936d-2743-4cc8-ad81-51c995ace569",
        "Identifiant1h": "7447f524-dc1b-46b5-978b-f276922a3ca4",
        "Identifiant4h": "3350e604-705e-46f9-820b-3584996b0ed4",
        "Identifiant8h": "23478912-35a1-4f06-822d-39b899ccd67f",
        "Identifiant1day": "e320d5b6-634c-480d-9719-43c4611cd581"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_SdM",
        "VariableId": "c37b5c83-2dd8-4cb3-9d5e-c023abccb282",
        "Identifiant5Min": "558303a3-ec1f-42b9-a68a-0262d03ee983",
        "Identifiant1h": "4b8fa4ab-a298-4ae5-896b-34df4f4e4e09",
        "Identifiant4h": "e03674b5-4334-45a9-a559-dfde2aaaf2b8",
        "Identifiant8h": "16b1e2b1-5637-48fc-a08e-9487db27d6f9",
        "Identifiant1day": "516890cb-6e31-4ac4-88c3-7982b09232df"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_BAT_25",
        "VariableId": "60cc5989-ea3b-4b4a-a203-3b2e69f2af36",
        "Identifiant5Min": "4216015b-fdc3-436c-af0c-8b1d4f19a863",
        "Identifiant1h": "13aa8675-6543-4031-9f9c-a00a2e70ed7f",
        "Identifiant4h": "a85cc3c2-d545-46d0-8f68-b359e5349286",
        "Identifiant8h": "5ad5cae2-c458-4c39-b634-0dd63e240cb7",
        "Identifiant1day": "503724c8-e7c2-41ec-b67e-b260df4266e8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_BAT_25",
        "VariableId": "4d92ae41-61e3-4ac3-a2d0-d75e16d6be4b",
        "Identifiant5Min": "ec2c6dac-5839-476e-ae49-c40e3eed70bf",
        "Identifiant1h": "1ae91839-f753-4ae2-bec1-abb865a99aaf",
        "Identifiant4h": "f2212971-4585-44c1-b126-be687518f19c",
        "Identifiant8h": "5309e582-153d-4b4a-9437-a447eed4faff",
        "Identifiant1day": "f9123446-90d4-46b6-85a5-90ff5a24de26"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_BAT_25",
        "VariableId": "862eef3d-02f7-4303-ad58-44b7271f6bdf",
        "Identifiant5Min": "3ac00c15-e95c-4478-8b6f-94352086cd02",
        "Identifiant1h": "eb811ede-2e77-4fe1-ae5f-983d410a1e83",
        "Identifiant4h": "3089a35f-bc86-47ce-bd8b-35d0ea4a456f",
        "Identifiant8h": "6e4e5d82-43c5-4e59-9e48-60bfae6ba428",
        "Identifiant1day": "737b0a38-f4b0-4636-846a-0cb34aec3096"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_BAT_25",
        "VariableId": "8e6f6da1-c869-4a80-9d9c-e4ef2967e6ab",
        "Identifiant5Min": "68ee5498-7815-4e6a-afc3-20af6f365d31",
        "Identifiant1h": "cc9dc9f0-3a7b-4484-a641-a839f6617841",
        "Identifiant4h": "7012fa7a-d878-4dd2-9aa4-28ac6071bd85",
        "Identifiant8h": "d4656024-3242-4956-b644-2854dbe0f689",
        "Identifiant1day": "1bff7d83-1ad8-4ac3-a6d7-bab803accb60"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_BAT_25",
        "VariableId": "67b79d11-e22e-466d-995e-0362bfe64ce6",
        "Identifiant5Min": "c091ffc4-782f-4ccb-812f-87c42bb7a99d",
        "Identifiant1h": "3b4ce856-6752-4646-bc59-a0ccd5f403c8",
        "Identifiant4h": "f314630b-9297-4f01-b838-1334e527813b",
        "Identifiant8h": "317bb32b-3e0f-4bec-87d3-3efdf5fa82f5",
        "Identifiant1day": "c618e9d4-a12b-457a-8cb6-d9b541753ba1"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_BAT_25",
        "VariableId": "f411a1de-c78b-4602-986b-2bc019d49170",
        "Identifiant5Min": "0dab7721-162c-4c98-aac9-b993343a595e",
        "Identifiant1h": "c3e89646-d070-4f3b-aada-eca427395064",
        "Identifiant4h": "9d17239a-c890-42dc-b54d-969022acab34",
        "Identifiant8h": "66153e46-0349-44e3-88e5-d29267b54ae6",
        "Identifiant1day": "5553488e-503a-452d-b440-42a285fe12c8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_BAT_25",
        "VariableId": "50923078-5740-4297-a5f2-e573e2ac55e3",
        "Identifiant5Min": "eb42f405-5142-4131-b11b-46d081275be0",
        "Identifiant1h": "cdef3d57-592d-49c9-be6d-ac06de4ab8e8",
        "Identifiant4h": "7caf6383-536c-4cc8-b304-d9366ecd4c3b",
        "Identifiant8h": "f9237782-0a5e-4630-8956-1f6197bf85d5",
        "Identifiant1day": "74c6230b-8d0c-451d-afd6-3d297cf71c45"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_BAT_25",
        "VariableId": "e62a2616-73c5-4516-b8d8-7d775fe65522",
        "Identifiant5Min": "ca683768-98a3-423c-8111-4c3aec1b9fbc",
        "Identifiant1h": "96d40c2d-9c99-40a2-94d3-7dccf3b12214",
        "Identifiant4h": "856efce3-348f-41f9-bcc7-942e85002bb3",
        "Identifiant8h": "8c26d35e-fd4c-45b2-bdf9-acad115f969f",
        "Identifiant1day": "a30b6720-232a-4b72-8475-e3d4e50a5074"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_PUITS_2",
        "VariableId": "5a5aa6c3-c1ae-4142-87b2-b74ebdec5c10",
        "Identifiant5Min": "9b6cacf0-99f4-4d55-9748-192d263ee74e",
        "Identifiant1h": "f5873504-0594-48f2-81ec-7b45c99004c7",
        "Identifiant4h": "4f020cc9-e888-447b-a9ce-3bb339d88a73",
        "Identifiant8h": "57c7e7ca-c093-4a95-a904-08a034317316",
        "Identifiant1day": "44ea3a9e-2a33-44bf-a0bd-59bdb85ab6cb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_PUITS_2",
        "VariableId": "399d1b38-17f4-4be5-9773-739ca398f619",
        "Identifiant5Min": "10704d3f-da78-48f0-991c-6926712d7866",
        "Identifiant1h": "9f3b3eb4-c4c7-4dcb-b9e0-f186eacfd20d",
        "Identifiant4h": "d05fd72c-ee17-41fa-8be1-fc0e8a8afbbf",
        "Identifiant8h": "8d62c289-e833-460f-baf3-19f96994653a",
        "Identifiant1day": "c595bbb6-5e55-424d-9861-170b4772e5fb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_PUITS_2",
        "VariableId": "0af9ff9e-801b-43d7-b67d-c3efcb0091fa",
        "Identifiant5Min": "0b8e8a86-dbbc-4dd7-87e9-bdaf34191b7f",
        "Identifiant1h": "dfe28492-b88e-4157-ab91-c97bef8587fc",
        "Identifiant4h": "dfee7cba-4251-4026-bc85-77afd298a1ea",
        "Identifiant8h": "7ecf167d-b143-419b-9cb3-97a02fcf5d5b",
        "Identifiant1day": "ed2a245e-2d5a-4696-9b4a-7bfa3cbca1cb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_PUITS_2",
        "VariableId": "094bdb07-34db-487c-a828-a8d0e05fc958",
        "Identifiant5Min": "6ef95e83-b1ca-430a-a373-342f8fe6fd52",
        "Identifiant1h": "dfe03f96-2ece-4543-adae-98d15eec67d0",
        "Identifiant4h": "79dff5c5-4217-492b-8fc9-8f95c772a13a",
        "Identifiant8h": "6286162e-8f3a-44e4-b014-f48031e85d4e",
        "Identifiant1day": "48d5a176-92f5-4746-b706-1221cae84d55"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_PUITS_2",
        "VariableId": "d270e067-179c-4be0-b910-82feb290f769",
        "Identifiant5Min": "79637a9c-604b-42ad-8cc2-179cc37a2ac0",
        "Identifiant1h": "9ea4f96b-2724-4bc2-b3f3-c89eb5644cd9",
        "Identifiant4h": "42df7838-02d5-4ed5-a09b-e8b1a54f966d",
        "Identifiant8h": "86574e59-f249-49b1-bced-252439162044",
        "Identifiant1day": "55ebb3a7-2e17-4d36-bb91-066b0b14f1e7"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_PUITS_2",
        "VariableId": "677d94d1-0819-4c8c-b437-115eb15608e1",
        "Identifiant5Min": "fd37cb21-fb6d-42da-9fa1-8d3019e4a48e",
        "Identifiant1h": "fbfc4c75-d508-4b97-bb1a-d907d5c06623",
        "Identifiant4h": "24ed8cf3-b516-4c05-b25c-757552228199",
        "Identifiant8h": "910310cf-7017-4aa9-8ce3-6e144aa42dbf",
        "Identifiant1day": "349ebf99-989b-424c-ba9e-3f7de37bebdd"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_PUITS_2",
        "VariableId": "435dcaec-860d-4e72-8ea7-bb386b04a8b0",
        "Identifiant5Min": "92d72206-8971-42a9-a3c8-9c2b3f9dd361",
        "Identifiant1h": "e4488738-db1a-42a3-9b32-1ff39b00e18b",
        "Identifiant4h": "d94aa048-334b-40c0-95b6-0d64a011fda0",
        "Identifiant8h": "66822f7d-e385-437e-bdce-83b860750074",
        "Identifiant1day": "369c05e8-9a73-44bf-9d1e-1fec8634eb31"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_PUITS_2",
        "VariableId": "60c2d8d2-9531-43b6-9b19-b2218e92c90a",
        "Identifiant5Min": "ac368698-caff-41e0-a8de-7d86d420d3e1",
        "Identifiant1h": "22fc150b-9371-4c68-ac2b-090d5ce9a91e",
        "Identifiant4h": "c831963d-53fe-4329-9b5e-11087bd4de86",
        "Identifiant8h": "0e393320-a0d2-41d5-827c-9596ebb1566e",
        "Identifiant1day": "693926b9-5c0d-4100-8ebf-7928de318bc6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_BAT_19",
        "VariableId": "bcd35744-14ad-4152-97f8-4011b7ad8fc0",
        "Identifiant5Min": "e6f0d230-c7a4-4f11-a263-d70f2c11ea7a",
        "Identifiant1h": "64ff6eac-02c5-4ab6-8bc6-c08198cd332e",
        "Identifiant4h": "eb2bf147-1e4e-4668-b2a4-6290cb151afc",
        "Identifiant8h": "3614cc3e-bad2-4ecd-b154-600e5a390811",
        "Identifiant1day": "881de0a5-2d13-4c5e-9bda-d3443da168be"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_BAT_19",
        "VariableId": "6e54c44b-c604-44c4-bea5-8561cea59f7c",
        "Identifiant5Min": "8778f276-0ccb-429c-b334-7a0cd3f9e668",
        "Identifiant1h": "ee859553-f8a5-433c-9b40-9bf5da26ca35",
        "Identifiant4h": "e8a7e96e-7b50-40af-bab2-cb9293a1f753",
        "Identifiant8h": "ec567d80-991f-485a-9e7c-03d39d17c4d1",
        "Identifiant1day": "af2aa43b-ff64-4441-90e9-6219b77ea460"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_BAT_19",
        "VariableId": "b5df0601-8647-4c2d-a34e-38a56171cfb6",
        "Identifiant5Min": "0362cc38-2036-4cf0-806d-a7a5a149d815",
        "Identifiant1h": "2da2f8af-9c82-4697-913a-4002d8160485",
        "Identifiant4h": "fbef5a49-0727-483c-84cc-aa33fbf48ec9",
        "Identifiant8h": "803ee486-4ade-48cb-b74e-2b1a65edfdc5",
        "Identifiant1day": "0f70ff0b-7949-47ab-9270-1f6181bfcb17"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_BAT_19",
        "VariableId": "4907736f-4d09-4332-874b-d89792f94710",
        "Identifiant5Min": "136210dd-5354-4109-8260-bea25a15467d",
        "Identifiant1h": "2e54699a-4f0a-441c-a5a9-ddbd008c1da2",
        "Identifiant4h": "d1bb3ffa-41ec-4475-9cd8-1e01be68716c",
        "Identifiant8h": "baa957c9-5c82-4743-8d66-fc84be0ef0b1",
        "Identifiant1day": "d1127ad3-1f7f-41a9-8f62-b9d712980c18"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_BAT_19",
        "VariableId": "21d39c41-2bbd-456d-baf2-b9a5c48a12b4",
        "Identifiant5Min": "6f018780-ba4a-404e-bf6c-a2ef41e58c61",
        "Identifiant1h": "6c9d7905-d6bb-4361-a9c7-cfebf09de3ce",
        "Identifiant4h": "d763a5f0-a486-44a1-b2a5-3730722e791f",
        "Identifiant8h": "3fe7a3f1-2ec8-4ac0-be71-577870bc3e6f",
        "Identifiant1day": "c2bdf073-3848-4095-8a9c-33c4f28bb51a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_BAT_19",
        "VariableId": "3500cd38-6555-447a-8f17-051ef8afe8a5",
        "Identifiant5Min": "b204aaa7-a85d-4359-ac04-b60c71c0809a",
        "Identifiant1h": "3bfcef82-1018-4993-bab1-970ed48d9f52",
        "Identifiant4h": "5021758d-f880-44bb-962d-572de3e796a9",
        "Identifiant8h": "783caf30-c215-4cae-a899-c65e045247da",
        "Identifiant1day": "02e28afe-ca8b-41ee-8b7b-3a72c0b9adf8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_BAT_19",
        "VariableId": "45d56168-b8d0-4c41-ba2b-18e2cc93404a",
        "Identifiant5Min": "c0dd725d-d53b-4566-9605-603f50744200",
        "Identifiant1h": "1d6f35a0-6aa2-4750-b49b-ac191d6f60c5",
        "Identifiant4h": "e0a5d64c-fd64-4441-802e-8af915708ec5",
        "Identifiant8h": "fe8cc35f-7dc4-4131-811d-a7e054ca0eed",
        "Identifiant1day": "97cabfbd-d411-4bd7-852a-9bab4549f9c3"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_BAT_19",
        "VariableId": "2c7aae92-5a30-4540-9505-3a403bc96bab",
        "Identifiant5Min": "b6f2ba81-e980-44e5-b3b5-ddd51130aed4",
        "Identifiant1h": "d457c46f-1d91-43a3-b2d3-ebb6aaf8d989",
        "Identifiant4h": "27bc9a5c-5ece-4cd6-b76e-fed6c269839f",
        "Identifiant8h": "0419955b-b8d0-4ee5-9346-3559d7a56fdc",
        "Identifiant1day": "5ebadb86-25f1-41ea-91ea-4a5c2cfe1531"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_BAT_20A",
        "VariableId": "d3224883-ddd3-4f9a-b1db-9b940d219dfe",
        "Identifiant5Min": "6f90a8e9-6091-421c-903d-7e29c541d007",
        "Identifiant1h": "0a0f80de-a272-440a-b3bf-631dbc4fe51e",
        "Identifiant4h": "4b452078-8245-4586-9454-757af57154a5",
        "Identifiant8h": "fa089f04-26b3-4c20-8aef-1d616f2d929a",
        "Identifiant1day": "0be3af95-9676-4dca-b637-218293b6ea38"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_BAT_20A",
        "VariableId": "c415e4aa-51b7-45cf-8c9e-220357ba94aa",
        "Identifiant5Min": "1c31399d-0371-41dc-99fc-ffe14771d3a9",
        "Identifiant1h": "fbb70b99-0bd5-4a73-bc17-d2c6654588c5",
        "Identifiant4h": "0626f358-6d92-49b3-9b67-6b58cb7aa7f1",
        "Identifiant8h": "c78ffa87-ea9d-4255-aa01-49393a448ebf",
        "Identifiant1day": "6680e587-6ebf-48e9-ba08-175ad3127975"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_BAT_20A",
        "VariableId": "ee2b62b8-6dc8-4133-8d52-325076e572b2",
        "Identifiant5Min": "6800ed7c-d7eb-44a2-a7f5-2749ad60cd55",
        "Identifiant1h": "39df7973-a420-4909-8a18-9cd8c45e8fb2",
        "Identifiant4h": "bca9a70c-0e76-493c-9603-2e1f1cf0c165",
        "Identifiant8h": "e3aeb1ab-3f0a-48b7-a5e9-b41e523e7793",
        "Identifiant1day": "2127289a-6f67-4322-a7d7-9d50fbb8d198"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_BAT_20A",
        "VariableId": "219ab71b-d999-47b4-b2d8-e3e482ba3dbb",
        "Identifiant5Min": "fcc1af09-01c9-4ade-b8ca-2376d06078af",
        "Identifiant1h": "1cfd166a-6afd-49ff-8bbd-592c14e96f4b",
        "Identifiant4h": "555a6b7c-f230-4e2d-bfd6-fbb1bbae1c3d",
        "Identifiant8h": "3e61ccf1-27ad-4909-82da-d062dfbf0d7c",
        "Identifiant1day": "03c323a5-7593-4305-aa70-0b52df43c40f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_BAT_20A",
        "VariableId": "cab97ea9-8a60-4a75-9251-c017efeeca41",
        "Identifiant5Min": "7b9d2d46-e220-4951-9f41-439e3204bbb4",
        "Identifiant1h": "e7b1b152-9f6b-4ed9-98e0-a6b664dc9b21",
        "Identifiant4h": "c045e276-98b7-4c33-88a2-b618d0cd6a04",
        "Identifiant8h": "0d5df9d8-7371-434a-9b99-b73ed7761148",
        "Identifiant1day": "c7139f4b-37d4-4542-a5ec-3acb9c51b09c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_BAT_20A",
        "VariableId": "d2af8de6-70a1-4998-a633-5049483766fd",
        "Identifiant5Min": "ec3292fc-d615-42ba-8bbf-bdf8cab007c4",
        "Identifiant1h": "f1cde031-ba35-43ca-bd06-b37778566dbc",
        "Identifiant4h": "921942a5-18e2-41b2-bbfb-c4f96e745ff7",
        "Identifiant8h": "f1baeaec-7c8a-468a-988b-1450a91694ef",
        "Identifiant1day": "ba466215-f393-4414-a771-5b6bcda2278b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_BAT_20A",
        "VariableId": "3f9b813d-f2da-49ef-9496-f692216a3f70",
        "Identifiant5Min": "4695d39f-05d7-4058-a0d1-9c5c4b5a3df5",
        "Identifiant1h": "45b0489d-5005-44ea-8602-419762f67cd8",
        "Identifiant4h": "2414e637-2053-4c73-bfe5-27a706872e41",
        "Identifiant8h": "9ef93496-509a-4fc7-bbbc-62546e8b0426",
        "Identifiant1day": "a949d3b2-b575-45ad-ae7a-9035b5726e12"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_BAT_20A",
        "VariableId": "c5f8604f-a39c-4677-b4f8-9e55cee4a680",
        "Identifiant5Min": "4b821ea0-e99d-47b4-a6d2-d856d13b5c33",
        "Identifiant1h": "1e1389e1-f5cd-4c58-8a62-a044c3e59af5",
        "Identifiant4h": "8cf130a4-2840-4500-bbf6-2e37f1cb83cc",
        "Identifiant8h": "3e2ea169-b8c7-49a2-8be8-b7272de51163",
        "Identifiant1day": "05aab9c7-b971-42a3-b7f6-d407cffd0447"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_BAT_20B",
        "VariableId": "df99c6e1-99e8-476a-95d4-93e5f5ad0ad4",
        "Identifiant5Min": "c92eef11-d1f4-4f0e-9935-ef3c62ec5b5d",
        "Identifiant1h": "89b7ddfb-2468-469d-b07a-c6134dbff3e1",
        "Identifiant4h": "b81b7678-30de-4e8e-8647-5929747ecf1c",
        "Identifiant8h": "3b467db5-1e72-456c-acde-37d3ba4bd69b",
        "Identifiant1day": "933d53bf-3734-48e5-8f40-cd9f0eca4706"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_BAT_20B",
        "VariableId": "99f63ae3-ed6a-4b03-a1f1-d4ee04433ba9",
        "Identifiant5Min": "12587329-9acb-4a4a-9859-d5885e223f4c",
        "Identifiant1h": "19ae77ae-1a63-4ca8-a865-cf440b5b86e4",
        "Identifiant4h": "ab725b03-2a4b-45cd-8228-b07479b6097a",
        "Identifiant8h": "409d2bef-32a9-4f89-9978-1333e2a0f853",
        "Identifiant1day": "a4ab1568-d1d0-4e11-b367-3001c73898d6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_BAT_20B",
        "VariableId": "39aec109-a937-49c1-a1d6-adcec3b7579f",
        "Identifiant5Min": "43b69f70-072a-40cd-b9f9-2870396d86eb",
        "Identifiant1h": "76f09a7b-e5a9-4a31-99a8-0dfb4f06812b",
        "Identifiant4h": "ce7eadef-4aa9-41ce-9bf1-e79bec68b98e",
        "Identifiant8h": "ae17e84b-676c-4e82-874c-c778129f7f28",
        "Identifiant1day": "45190867-6d7b-4c1d-9f25-44a9ee9a2d21"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_BAT_20B",
        "VariableId": "222aba05-d7c6-4942-b100-a17375d94848",
        "Identifiant5Min": "2141e917-1054-40f6-b5ab-b89df53ae824",
        "Identifiant1h": "996b2691-c125-4426-997a-af886d3c7456",
        "Identifiant4h": "17b2b75f-dcd9-4cdb-84a4-2707309d78b9",
        "Identifiant8h": "829f5995-1007-4e39-a401-1931e7e2f65f",
        "Identifiant1day": "d8f76529-5400-400a-a7ab-18232751fda5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_BAT_20B",
        "VariableId": "781502b6-c26c-4499-8159-344278533afd",
        "Identifiant5Min": "09e29333-4390-462d-b3e1-3a47fb2a9bcb",
        "Identifiant1h": "a22555eb-eeb7-4810-afed-58f52ef83d0c",
        "Identifiant4h": "21796c57-0958-43f8-a545-e8fdbd17c456",
        "Identifiant8h": "10944982-ce99-4ff5-bbe0-13f9c21cb6df",
        "Identifiant1day": "6b42ffc0-b557-4202-8320-79ce07f9497f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_BAT_20B",
        "VariableId": "c01ad1d8-ba4c-4f15-a44b-43a4424ede9a",
        "Identifiant5Min": "70e17384-ca2d-4a3a-91fa-d81e8bfa7d6c",
        "Identifiant1h": "10daa6eb-9a2b-4ffa-a265-a5e2e14dfd83",
        "Identifiant4h": "a7b608ce-1312-4990-97b4-99b3c99e0b7e",
        "Identifiant8h": "d7e1aa09-7f7e-4f7b-b1c7-a43d71770900",
        "Identifiant1day": "1ebad6f5-614a-45bd-a5f9-7c8ae8fde321"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_BAT_20B",
        "VariableId": "be165700-b507-4156-ad53-c9bd2707af8c",
        "Identifiant5Min": "59da2fa3-8497-4c21-852f-8aa4ea4ed42c",
        "Identifiant1h": "fb17bb17-4afe-48e7-9394-ef848617e313",
        "Identifiant4h": "6f2a525e-aec0-4d72-a6fb-54e2619c04a9",
        "Identifiant8h": "aef700ea-3acf-4165-9b59-aa484439b82a",
        "Identifiant1day": "e2980a08-254d-43c0-8d42-a7828e470f5e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_BAT_20B",
        "VariableId": "05d12f1d-8cdd-4954-9097-88da7439cb3b",
        "Identifiant5Min": "db848c86-048d-466c-ae45-f6d6fc0d62b2",
        "Identifiant1h": "3b4e7f99-6e0d-4521-88b7-48173ac9a072",
        "Identifiant4h": "e252767d-cece-41f3-a0cf-f865ef5f6737",
        "Identifiant8h": "b06d6c80-ffc4-4587-837c-eb8554ba0084",
        "Identifiant1day": "1809dffc-9c28-46c1-9588-758177c71fbd"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_CATA",
        "VariableId": "6edc5375-fa19-4a25-946f-2d83b4a754c7",
        "Identifiant5Min": "6b762c0f-ba17-4645-b5e9-9f7a307f3c0e",
        "Identifiant1h": "3c0d1709-582b-4876-bc3d-8b3b42cba6ae",
        "Identifiant4h": "924ddd79-1e05-4bb4-9549-47ffae46ea2e",
        "Identifiant8h": "4e74c166-bab5-47c6-9f35-70ba23f25b4e",
        "Identifiant1day": "ff9dfbfe-2ef9-40af-91a3-236e3cf586f5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_CATA",
        "VariableId": "ed2054d9-5a34-4b59-a583-e88b7fc68670",
        "Identifiant5Min": "b3b78593-6191-454d-9d82-c01d148b5240",
        "Identifiant1h": "08eb9888-5670-4f16-be35-d377209e1f1c",
        "Identifiant4h": "b5138395-e732-42f8-b33e-4d2d6856e8db",
        "Identifiant8h": "fd4c124c-1740-46a1-80ec-a888ff88e347",
        "Identifiant1day": "e966c6e6-7c1b-4fc8-92bd-f13ea6c928ed"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_CATA",
        "VariableId": "15d05464-912c-4fa0-a91d-40e0aa16580f",
        "Identifiant5Min": "70aac78c-0c42-4f9b-810c-7de97fae1221",
        "Identifiant1h": "6c799d99-2368-49d6-993d-575106482d21",
        "Identifiant4h": "2ddb018c-6395-433f-9fb5-726afc6c1d2f",
        "Identifiant8h": "e3a767c4-3d7f-4c9c-84da-85340a36a7cf",
        "Identifiant1day": "625819f8-8a1c-4c2b-a945-0bea19b748e9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_CATA",
        "VariableId": "6fb78c25-01d3-495c-82dc-d9003175c770",
        "Identifiant5Min": "8ac4745f-e6ae-490b-ad80-274cb77d06a8",
        "Identifiant1h": "2d809672-eeab-42cd-8cf8-dd2507b0bfe9",
        "Identifiant4h": "fedbddb8-445a-4416-bf1d-e7b3c352af37",
        "Identifiant8h": "cd70b439-f1df-4d4b-b66e-3ba10dd33862",
        "Identifiant1day": "418f113d-ff12-4660-93e3-53b798be5703"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_CATA",
        "VariableId": "8470e984-7c1a-4279-a7f9-7f8856119396",
        "Identifiant5Min": "5996fc8a-a6b0-4eab-bcb7-84b6240f4359",
        "Identifiant1h": "e800ed37-9339-48b9-9864-df2fccd8457d",
        "Identifiant4h": "b1e289cd-fb79-43e9-b461-cb6c3bad42b4",
        "Identifiant8h": "c0574fa1-37ae-4c1f-bf26-eb8f9202fab2",
        "Identifiant1day": "410d16fc-4934-4e2a-a6c2-d8a0a41eba94"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_CATA",
        "VariableId": "822fb1bd-99f2-4ba5-aeda-b2cd504ba816",
        "Identifiant5Min": "675e9abc-3b13-46a2-b7e0-2e965ed46dac",
        "Identifiant1h": "e644ad36-41a3-4073-b543-cb8f074c912a",
        "Identifiant4h": "16f2bc54-a326-46a1-aaab-afe0d5c46b70",
        "Identifiant8h": "d6155664-f7ae-4954-ae42-339b393b6371",
        "Identifiant1day": "e1518f5b-0fef-4016-9b30-1d006377f1c6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_CATA",
        "VariableId": "54a331a0-2307-4b78-a85b-4b20649364ae",
        "Identifiant5Min": "e199368a-4524-4003-afdb-a7ae050ec01b",
        "Identifiant1h": "86cc1b3f-82e7-4c84-ac1f-4285dd3480d8",
        "Identifiant4h": "2a8c8288-6a1d-46c4-b8c3-4c8c983c8bc0",
        "Identifiant8h": "3c59d59a-32a0-47b4-a9a4-2dac32576928",
        "Identifiant1day": "a8dc02fe-5c76-4a1d-aa80-6c69dc0c2ae5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_CATA",
        "VariableId": "a357232d-fc7f-44d7-9d3f-5274cb86034e",
        "Identifiant5Min": "9fc889dd-0f9d-4ffa-add4-1bfae318f9db",
        "Identifiant1h": "8f7f1c72-8e33-4701-8773-e32b3f09f2de",
        "Identifiant4h": "d938b7ac-4b7d-484e-8b8a-25e60e10a560",
        "Identifiant8h": "77e168aa-5f31-4c61-850d-2f8baa442dbb",
        "Identifiant1day": "28d12810-881d-4b16-a0c1-f01b3c9feaf2"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_CAB4",
        "VariableId": "ded25e77-b690-4ab7-a369-55ccc18978ea",
        "Identifiant5Min": "d841e342-d8e2-4029-823b-0d4e4cec2e92",
        "Identifiant1h": "201a45a0-6c4b-47fc-928c-abeb81539cf2",
        "Identifiant4h": "991faea1-d8e9-489b-9ded-7b54d38ea726",
        "Identifiant8h": "5d77f50c-03dc-4cd6-ad6b-110f5df732e4",
        "Identifiant1day": "f752cc2c-6f84-4bd6-8448-c6a08c59c9d0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_CAB4",
        "VariableId": "4d1522bd-7429-4b10-8307-8c9518f6b6e7",
        "Identifiant5Min": "afc97833-d2e9-48fa-bf64-bba80fadd57f",
        "Identifiant1h": "24276063-86ce-4b95-b7ee-aac643c43d58",
        "Identifiant4h": "122224e2-fa04-4e43-819d-c8e431f44fbd",
        "Identifiant8h": "45c404fb-1232-4aee-a13c-cff703bbddd9",
        "Identifiant1day": "8f582eeb-55bd-40ad-89aa-96dadeb1876b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_CAB4",
        "VariableId": "320dc13a-98ef-4e1c-8bb2-06220f5a99fd",
        "Identifiant5Min": "1041754e-ba46-4a99-bc6f-69036d6485d3",
        "Identifiant1h": "a120bad3-bbc3-45d3-bf85-a9cbd4239252",
        "Identifiant4h": "7d1615fd-44c2-4aa6-b6b2-76348df29fb5",
        "Identifiant8h": "206b60f8-476f-48fb-8017-91fd64099c97",
        "Identifiant1day": "ccfb6706-9d1c-4a4a-8ada-adf9165859d0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_CAB4",
        "VariableId": "b6c91367-b0b7-44bc-a909-623647e939be",
        "Identifiant5Min": "6c3cac3d-c7f8-4ebe-b5e9-a137dbab0c6e",
        "Identifiant1h": "53c9359c-2c61-4281-b8ea-7234005070d4",
        "Identifiant4h": "c5814e92-1d69-4ed4-b677-2b03034f63a7",
        "Identifiant8h": "dbafd440-5328-4093-9bdd-aa0c553be762",
        "Identifiant1day": "dd1abc89-da3f-4ad6-9f38-0e16bb01d102"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_CAB4",
        "VariableId": "8c0ac7a6-c18f-41d9-9334-3b4a28e3f1ce",
        "Identifiant5Min": "383ae102-f20a-45bb-aa4a-8188d46dd2ce",
        "Identifiant1h": "a8f0ddb1-867e-403a-b113-c5d9094dd50d",
        "Identifiant4h": "b97a7c3f-f86e-426f-9228-631c33586180",
        "Identifiant8h": "b3fd0fa7-bb1a-41f8-9fb7-e04b41cdaec1",
        "Identifiant1day": "ae68fefa-f036-4526-b49f-cf0a79cc96ef"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_CAB4",
        "VariableId": "d08dbaa3-466b-42d6-8fbf-0c0e98d93255",
        "Identifiant5Min": "3cd41a08-c3fc-4563-b7ab-6af47126df51",
        "Identifiant1h": "3df9304c-9547-4b61-8961-7cf350985d70",
        "Identifiant4h": "3e80df54-b7f2-4abe-9387-1b6c5aacd3b0",
        "Identifiant8h": "8e3ca7d4-cda5-4718-b3af-b0e6f201f2e8",
        "Identifiant1day": "01f7448b-a422-4162-8957-91762182bc07"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_CAB4",
        "VariableId": "4d4019e3-0aa0-42f7-926d-2ba41c68c468",
        "Identifiant5Min": "bb98cc93-54d2-4f16-bdc1-6917d37c27e6",
        "Identifiant1h": "948dfd64-0574-4152-a481-fefe98f09201",
        "Identifiant4h": "a39b27ff-70c2-44fc-bdbd-37fd3546c713",
        "Identifiant8h": "346fe83e-3359-41f2-9c6c-d1d61757d0c4",
        "Identifiant1day": "d25cc0be-2ea7-43ec-8ede-3f746ac15250"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_CAB4",
        "VariableId": "95fdbad8-0579-46e6-8326-4927fc6c2ccf",
        "Identifiant5Min": "9e9ea96a-f863-46f3-bdda-59b27706020a",
        "Identifiant1h": "e0ee37e1-ab80-4550-9521-661116db6f88",
        "Identifiant4h": "100ecea8-784d-4e1e-98b0-0a7e83506e92",
        "Identifiant8h": "120c23f8-8413-41f7-92c4-4ce23f22e1e0",
        "Identifiant1day": "498f53f3-2d3e-4045-b27c-114966a1e210"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_PPM2",
        "VariableId": "7374629b-177d-42a2-9d95-84ec7a83cbaa",
        "Identifiant5Min": "0e7e7dd7-8604-4b32-af80-0d2bed63d41e",
        "Identifiant1h": "e50f1d15-63f9-4bf2-9f87-3be0274ff133",
        "Identifiant4h": "20fe6ba5-ccf8-4aad-a57f-f1e4ed9e242b",
        "Identifiant8h": "510e3871-8bc6-4558-b999-fa0720e932f6",
        "Identifiant1day": "eb8a2f7a-dd5e-4314-a8de-1ee050d7c4cc"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_PPM2",
        "VariableId": "18d88f19-8814-43df-8e06-f765830b0f4f",
        "Identifiant5Min": "44911ba2-897c-4a88-b0c7-75f4155c0bee",
        "Identifiant1h": "38735db4-6e47-4a1b-810e-0d2f4e8d3bc2",
        "Identifiant4h": "e6e1c9d2-fc4a-4322-8fb0-3222c1c7619b",
        "Identifiant8h": "5ff754ab-f41f-4c6d-93e5-b13efc261eb6",
        "Identifiant1day": "58c07b4a-1c24-4c1f-980c-482fe874206c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_PPM2",
        "VariableId": "02fb4d53-1321-4d34-8581-786584d69314",
        "Identifiant5Min": "acc90939-6b7a-4ba5-b90c-d432f1d02adc",
        "Identifiant1h": "c6b86ed3-2ac4-443d-b1cc-e489d55b03d4",
        "Identifiant4h": "c5479363-ee3e-4c52-89a5-c25e1317976c",
        "Identifiant8h": "c017e227-9c67-45c4-826b-f903300bdbba",
        "Identifiant1day": "03c52e22-a59b-4e9c-b13f-98b8adb658b7"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_PPM2",
        "VariableId": "4e4ea035-907f-4f34-abeb-d1de48195b19",
        "Identifiant5Min": "03d334ad-422b-4aff-92a5-d8fa69e0466f",
        "Identifiant1h": "4d6873a5-74a0-4917-a91f-c3e056683dc3",
        "Identifiant4h": "d396aa60-7aa5-4cd0-8c9b-b07a06d9c61b",
        "Identifiant8h": "89b0e15c-2e35-454e-99d3-0a8b44839f55",
        "Identifiant1day": "c0b70e49-591e-4e28-8f8b-05ea6ec0ed57"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_PPM2",
        "VariableId": "6c33a553-1188-4ebd-af37-4abcb9cbfa00",
        "Identifiant5Min": "812d8375-3b98-4c09-8dc0-8bd855915ba1",
        "Identifiant1h": "5a539150-f9a7-4d7a-89d6-7f120310614a",
        "Identifiant4h": "0e6caecf-8c99-42b4-9e3b-80a73e6853f7",
        "Identifiant8h": "c53492e7-9982-4eb4-a073-b4475083d260",
        "Identifiant1day": "64ddf096-e805-4b42-a3c1-7e6ad7a18fe6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_PPM2",
        "VariableId": "ead30ea7-f1cd-4024-8cf4-9c0aa4ca72de",
        "Identifiant5Min": "6eaebe7c-fc6a-4279-8978-92d7c700db00",
        "Identifiant1h": "08928a66-cc56-49c0-b065-cbf55bb0b191",
        "Identifiant4h": "10d64ed3-1a61-4c98-9f9d-f2523e57acb8",
        "Identifiant8h": "de3d8c93-6736-49e2-9740-8d7926565536",
        "Identifiant1day": "351367aa-2610-4bf4-81d8-14316303af58"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_PPM2",
        "VariableId": "98afb8d2-b5fc-494a-af56-578491ee5c99",
        "Identifiant5Min": "b96dab4e-a281-4887-ab0c-5f8683d72721",
        "Identifiant1h": "05b8f7aa-639c-4ed2-a626-a12ef61f9fef",
        "Identifiant4h": "3b19285e-8e16-4a81-b998-b0b1a6e9185b",
        "Identifiant8h": "47082e94-99c2-4d3c-83bb-38c88bddbc1b",
        "Identifiant1day": "c2a93433-3e9e-4192-a574-a275f54d7ceb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_PPM2",
        "VariableId": "933e149e-7d3e-4ab7-8fee-089b1b099e65",
        "Identifiant5Min": "692e6985-c6d7-4f43-9438-498896febdd0",
        "Identifiant1h": "ead0dc1b-413f-4b8b-a92d-08c2ca141898",
        "Identifiant4h": "169a0a4b-6fd7-4f3a-ac9e-143bc6d502a3",
        "Identifiant8h": "e4a0e4d0-025c-4c09-9990-300d5a5cd8de",
        "Identifiant1day": "5e6d511f-b950-441c-8b5d-da6a7693de1b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_COMMUN",
        "VariableId": "f246e712-3e4d-401b-b58f-ad7f89791eaf",
        "Identifiant5Min": "d79909f8-4fed-4094-8bc2-036e230637f9",
        "Identifiant1h": "a960a059-0d25-4d49-b285-5caedee70127",
        "Identifiant4h": "43f0d0aa-2b18-4974-94da-8af8a6d9fff6",
        "Identifiant8h": "8fa77194-7869-4b67-a656-34fbe061c805",
        "Identifiant1day": "9a58de9d-e5a5-4d9a-9bd2-afc2341e6a9e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_COMMUN",
        "VariableId": "de3360e6-64e6-424b-bf2a-6752808220d1",
        "Identifiant5Min": "591b103f-8f5b-4864-a0cd-f280b2200bc1",
        "Identifiant1h": "58863a85-e7d9-4343-89cc-af01e9d6289f",
        "Identifiant4h": "50ccfdfa-7e01-4c0e-b200-37044c937ab8",
        "Identifiant8h": "67b4c756-bc65-43aa-b62e-a8579adb371f",
        "Identifiant1day": "f4129320-8f1b-4310-a6c6-d511fa61368e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_COMMUN",
        "VariableId": "ad19273b-57b6-4e95-9151-16295dc96259",
        "Identifiant5Min": "3bf8d08a-b65a-4c82-99c5-90ff2c16ead0",
        "Identifiant1h": "a45350f3-f92a-4b95-9486-a07393d023a7",
        "Identifiant4h": "ea20dbcf-b1a4-4bf1-b1b9-3b58448f1170",
        "Identifiant8h": "0e4f5763-2ae7-401b-aad7-7b6ed2f4301a",
        "Identifiant1day": "04b5bbbc-878a-4a5e-8183-a3f7d795ae55"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_COMMUN",
        "VariableId": "c4a36e22-11f1-4ae2-bc7b-e6fc835af3c1",
        "Identifiant5Min": "41b7f979-a0f2-4fa6-a491-ee5d573d90d9",
        "Identifiant1h": "87fda582-23d0-466c-b201-7c953948dd45",
        "Identifiant4h": "732963e7-d0bd-44f3-9e47-c6b9e2b53d65",
        "Identifiant8h": "9ebaa4bf-dbf8-4efc-8aae-f5c9bdab0001",
        "Identifiant1day": "21316275-c5ad-4616-bcb0-3862752d87dd"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_COMMUN",
        "VariableId": "b6bbcc77-e7fe-4cec-94b7-f224a1624a9e",
        "Identifiant5Min": "c921a659-c2f1-4f3e-bed5-47a01efdb1e8",
        "Identifiant1h": "894c9173-bf3d-4dc9-a54b-670cc8e8d69c",
        "Identifiant4h": "dd242066-c5f5-41f4-a673-3994ce6e55c8",
        "Identifiant8h": "518371d3-8a5c-42cf-b0aa-c6ce0cadff43",
        "Identifiant1day": "afcd69f0-1a1e-4bd4-9ebf-ff1fc6351dc8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_COMMUN",
        "VariableId": "79ea4449-912b-42e0-b4a3-c6215f90b35c",
        "Identifiant5Min": "ddc5ab0e-4bbb-4074-b01c-7d13ce9081d8",
        "Identifiant1h": "6f9813cd-053a-4734-ae59-bcd5cb73b9d5",
        "Identifiant4h": "abfdd6da-f888-4b4a-8990-1ebb92448bfa",
        "Identifiant8h": "97c2e229-ee77-4773-af42-cb241b466d0b",
        "Identifiant1day": "35ca6bce-ee2c-4360-a053-35a024f039ba"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_COMMUN",
        "VariableId": "92c6c2b6-6145-4f76-a250-5473b89212bb",
        "Identifiant5Min": "134e535d-3aab-4702-ad30-9270709042c1",
        "Identifiant1h": "1bdebf1a-1624-4fe4-8293-bd2f7c2a259c",
        "Identifiant4h": "7ccbe06d-c24b-427e-800a-1647e1907173",
        "Identifiant8h": "17bae393-34b7-43a1-a931-a406800362be",
        "Identifiant1day": "60827369-6bd1-4c79-a636-df0b4178967d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_COMMUN",
        "VariableId": "350d8d10-6d8e-4851-8f61-99637b7fbac2",
        "Identifiant5Min": "14538d53-d7c0-4748-a91c-676a6c790ceb",
        "Identifiant1h": "9804c84a-3b80-46dc-b85c-385a2f8cae3f",
        "Identifiant4h": "33e6556c-dafe-4ad4-8295-ae89805f9b34",
        "Identifiant8h": "5572f53b-8718-443e-ac36-ff63c046a664",
        "Identifiant1day": "97b412eb-88b7-4b99-bf5f-016d60f58108"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_USINAGE",
        "VariableId": "87811f76-19b1-4cac-acbc-f4ebab429daa",
        "Identifiant5Min": "18805bd8-6878-44a6-a0da-207f0b323417",
        "Identifiant1h": "c094793f-3f8e-4046-a3c8-eab325452c40",
        "Identifiant4h": "59ed1135-4cab-4d14-afaf-fada10e916a9",
        "Identifiant8h": "fa9ca3e8-d4cc-4967-8d4b-5a817d1fc8e1",
        "Identifiant1day": "080c1016-f7c4-4602-b85a-9096d30479ef"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_USINAGE",
        "VariableId": "a2024f21-d348-47fa-9cd9-ca0a98c2dd2f",
        "Identifiant5Min": "6bb77413-ac94-4e42-960c-f3670eedfde9",
        "Identifiant1h": "236cb775-9325-4475-bcc0-9de3f8f098ae",
        "Identifiant4h": "4cba9702-b989-47b9-94b4-025d591edd99",
        "Identifiant8h": "c78aecf5-5693-4ad1-b43b-b1d9c5cb266e",
        "Identifiant1day": "93efeddf-92e5-43e2-962f-9ceb31a73d52"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_USINAGE",
        "VariableId": "f6c8359c-03db-4cb5-aec1-c0452d1b1aeb",
        "Identifiant5Min": "4d948f86-8ef3-458d-af0b-7f6bfd1a0721",
        "Identifiant1h": "dfd8d09a-71b6-47e2-8b77-8a22dae78c26",
        "Identifiant4h": "7c042caf-a10e-4c1a-8380-2a85d1ced8d1",
        "Identifiant8h": "5270a6b3-a770-49bb-a828-7f4ceaaa1fed",
        "Identifiant1day": "b70d6101-9dea-4564-97f1-1f8c722187f6"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_USINAGE",
        "VariableId": "29e3fb55-c0ee-4070-9ef5-1ac63eb0d0a1",
        "Identifiant5Min": "66015963-2e12-4d1c-8ddd-2468891dbc54",
        "Identifiant1h": "04322bbd-3707-45f3-91f2-cf73d105a9cd",
        "Identifiant4h": "7e88097d-d484-4e31-b4cc-7ab4e5377252",
        "Identifiant8h": "b733923f-8597-4c30-b09b-952734838b3e",
        "Identifiant1day": "dde1d9e5-ad7c-4c5b-86a3-014d4155f03f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_USINAGE",
        "VariableId": "eaf4f2bc-9132-4878-a45d-7fbbec0ee0b0",
        "Identifiant5Min": "a8b16024-bc8c-4285-888e-f393b9627428",
        "Identifiant1h": "25b64012-781f-40a3-b451-f774b6330db4",
        "Identifiant4h": "c0b81c17-2f55-4f7b-8baf-8f525a9d5fc9",
        "Identifiant8h": "841a65a4-b670-423d-a79d-62e6aada29ab",
        "Identifiant1day": "8f939029-afed-41d8-98bf-18b2e959e69a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_USINAGE",
        "VariableId": "f456d613-3b5f-46f7-99c3-a24c35f80be6",
        "Identifiant5Min": "f85c68f7-ccdb-4663-b7a3-267d6db9e594",
        "Identifiant1h": "98b68185-0338-420f-ab60-50b319563b11",
        "Identifiant4h": "40fcf2f9-9c87-47d7-8f9d-936217917bfa",
        "Identifiant8h": "b4d45748-8b87-4fb3-8109-609ec714f374",
        "Identifiant1day": "1cf8bbe9-40ad-4b41-b1c0-a30d397cedbe"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_USINAGE",
        "VariableId": "950fecec-a9db-46a6-a111-288cad53fe7a",
        "Identifiant5Min": "68f62a41-9c74-4371-b23a-9f17759a31b3",
        "Identifiant1h": "558ed148-7458-425c-9035-1d5ddf4e13bf",
        "Identifiant4h": "0e18f710-c27c-4c8d-8ec9-7e65904fa913",
        "Identifiant8h": "336fdf0e-0e4e-4e66-8cc7-c06243671de3",
        "Identifiant1day": "1948e154-345b-4292-a528-5a9094be3b0f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_USINAGE",
        "VariableId": "32c22c0b-e0b2-48ae-903f-4f60cd559c35",
        "Identifiant5Min": "cecc1c00-91ee-4d62-8e66-9af31a071424",
        "Identifiant1h": "af682722-73b5-49b8-926a-d34f9f8a2a31",
        "Identifiant4h": "1d1d3f87-6ac3-48e8-b603-bb53a8fb6b15",
        "Identifiant8h": "6d33754e-03eb-40df-95ed-7afba7ae5a7f",
        "Identifiant1day": "ef658fbd-fba9-4a6d-bdd0-7b84ded1141d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_BAT_1E",
        "VariableId": "a2359e9d-231d-4865-86ae-86eb5f4c981e",
        "Identifiant5Min": "77c24df7-cc66-4937-8057-c3e625212fbf",
        "Identifiant1h": "d997d660-68ae-4991-929c-3539d8d41e85",
        "Identifiant4h": "9f17cb98-429e-4e4f-aebe-3e0a298cd5f4",
        "Identifiant8h": "0065fc28-d74f-4aa7-829b-593eced37739",
        "Identifiant1day": "74aa2a12-e491-4a2c-a04c-992228042412"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_BAT_1E",
        "VariableId": "703e17b9-5878-4f0d-8b12-4c3d22149e15",
        "Identifiant5Min": "46dfc7fa-a1d5-48a5-a072-9d7818a99ded",
        "Identifiant1h": "4748afef-407d-4fc8-9456-7b7b5b9583bf",
        "Identifiant4h": "c5c4df88-e27b-48e0-bee5-c48a422c6998",
        "Identifiant8h": "0e5d30b2-9fce-45cd-820a-09e5c5a51f67",
        "Identifiant1day": "5ae5a4cf-6ee9-47ef-af15-b91f48b5e71e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_BAT_1E",
        "VariableId": "91e47fbd-b586-4a22-997f-79afd6bf875f",
        "Identifiant5Min": "06cda29e-db3f-4028-afc4-e4ec81da6657",
        "Identifiant1h": "d2e391f2-38c5-4901-82d8-b56507584319",
        "Identifiant4h": "48459227-a917-4548-ae72-9a199f986ee5",
        "Identifiant8h": "48cdf685-c862-4688-9bfc-110fcf83d52f",
        "Identifiant1day": "2cd05ea8-8d45-46f6-b523-a89d8321432a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_BAT_1E",
        "VariableId": "2c918ef1-2f70-4be5-9e2d-42cd085c74b2",
        "Identifiant5Min": "7d31fac7-219b-46a9-80b2-a4295f33a65b",
        "Identifiant1h": "9a08ea1c-4db3-4b24-a372-5cb3b2a74579",
        "Identifiant4h": "6c6adc8e-c2e2-4237-99ac-4c9f28d3a6ae",
        "Identifiant8h": "a5967ed8-1f08-483f-b28a-5d40b69ca003",
        "Identifiant1day": "8c8e1238-dea1-4717-ba94-9f92a07c7e4e"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_BAT_1E",
        "VariableId": "e0367715-6777-4edb-97e5-734d29da7497",
        "Identifiant5Min": "abd1a852-4bff-4d4c-977d-bd79d3889012",
        "Identifiant1h": "a5f0ca26-1680-409e-bf93-9f4f83f6d1c3",
        "Identifiant4h": "eace9dd1-1809-43c9-b4d7-72f50a40e88f",
        "Identifiant8h": "b9d34c4e-ba41-4309-a3df-8d68e94a028e",
        "Identifiant1day": "bfeb7abe-b547-40d4-90fc-1ac53525bb70"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_BAT_1E",
        "VariableId": "27ad1905-cbc1-4de6-8ace-9562f2fd0225",
        "Identifiant5Min": "c3661a01-d296-42da-be1b-a79544ff82f2",
        "Identifiant1h": "6ec2bcd5-87dc-4c7e-bbbe-da1a3f19635b",
        "Identifiant4h": "71731518-18e5-43d8-b75c-a59ea23dfc06",
        "Identifiant8h": "3665f7ee-c3f9-40cd-99d5-aa4a5269f59c",
        "Identifiant1day": "3c43bc9a-ad1d-4f22-8233-aa39079a9bdc"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_BAT_1E",
        "VariableId": "ea56e776-03ca-4346-b156-ebf8d915d9a1",
        "Identifiant5Min": "f90a9643-f21a-40ec-8c1f-fa37b8dfe4a2",
        "Identifiant1h": "72d34260-7865-4dbe-83f6-bcc2c44a211c",
        "Identifiant4h": "6db1d8fc-856d-472f-a7b3-36209fabffa6",
        "Identifiant8h": "44989804-1cf2-43ec-8ecd-95d79ae34925",
        "Identifiant1day": "e14fd69e-7487-42ed-958c-36113c648c1b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_BAT_1E",
        "VariableId": "ad63fd60-924c-468e-81f6-a7b69cf3c481",
        "Identifiant5Min": "44cd43eb-88c7-4e58-9d0e-a3a3f03027ee",
        "Identifiant1h": "9437f240-3d0f-41c2-b9c7-e88c01abdb82",
        "Identifiant4h": "fd295af8-a625-44e3-ba0d-8807ff7dfb43",
        "Identifiant8h": "a82d0aac-265f-4275-a2fb-ffed1e84dfd2",
        "Identifiant1day": "2fc292f1-2024-421e-85a8-2623c9d44379"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_CTE",
        "VariableId": "7a7cfddb-93b0-4eec-89b6-8b135dda42ff",
        "Identifiant5Min": "18b119d5-34c4-4ad2-ad3c-26bca916db77",
        "Identifiant1h": "ca98aa8a-381b-4ba8-9dd7-faa817dc28ac",
        "Identifiant4h": "122977ee-3e28-4fbf-afe0-45e93d940224",
        "Identifiant8h": "576cd22c-27fc-4718-b38e-32d089847004",
        "Identifiant1day": "62dad95e-43cf-42b1-a3d3-3b6069bb1589"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_CTE",
        "VariableId": "b5c82c67-57d8-41cb-aa09-7e73714f6cfb",
        "Identifiant5Min": "5a008f9e-c45e-4137-9359-1cfc6b4808af",
        "Identifiant1h": "b5072ecd-455a-4a48-bea3-1988d09624b5",
        "Identifiant4h": "e59b2208-78ed-4a6f-a30a-15dc0f64f344",
        "Identifiant8h": "714e5ec1-7c90-4766-ad18-7ce37a5db2f0",
        "Identifiant1day": "a8631386-b419-4856-9101-23332b2e928a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_CTE",
        "VariableId": "012c7dbe-91d9-4f28-a14d-bc1492fa72b5",
        "Identifiant5Min": "aa36fb84-9f3a-43a0-a8a0-d732cb1f5c3c",
        "Identifiant1h": "fffc6ef1-0d63-41d9-bff2-1e1a795f5ae4",
        "Identifiant4h": "eb28b8e9-099a-4fd5-a8bc-3404995a9b57",
        "Identifiant8h": "c4aebf6c-9812-4814-bb6e-f615b838caf8",
        "Identifiant1day": "049e2184-ccf7-4430-82f4-7858534fd11d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_CTE",
        "VariableId": "b1b7b959-bdc6-434e-b488-7888840140cf",
        "Identifiant5Min": "b17397aa-6dc8-4dcf-8918-b58d8d02cbae",
        "Identifiant1h": "feaeea0b-b331-4b40-b642-e00f0a405c25",
        "Identifiant4h": "51981095-3bd0-47d4-9f59-d3f0bb9ec3bf",
        "Identifiant8h": "9a671d20-aea6-403f-b82a-9c61a7aa5f56",
        "Identifiant1day": "17a8aca9-7ee1-4499-9d7e-bc781d200ef0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_CTE",
        "VariableId": "c2665fe6-29c6-4ba1-9264-ba865cd4b48d",
        "Identifiant5Min": "53d52f2d-9381-46f3-96de-c84ee5f766f2",
        "Identifiant1h": "117c4dcd-96b5-48ec-82a4-e2fc1314ff45",
        "Identifiant4h": "559f8185-4654-4e82-b418-aac3385122a7",
        "Identifiant8h": "8d683316-7f1a-49f2-97bb-7842a34795dd",
        "Identifiant1day": "383eaefa-497a-4b86-9fca-fabee8613642"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_CTE",
        "VariableId": "30c00b67-2574-4d6e-b89b-e42ff4b1a023",
        "Identifiant5Min": "2465f2b6-c29a-424b-9be9-8a83d3b9fa5e",
        "Identifiant1h": "f6f70254-39e0-45de-87a0-dd8abf32a0b5",
        "Identifiant4h": "03d0833b-2a13-4989-84eb-98e846ec3e71",
        "Identifiant8h": "a394eec2-06b4-4204-bfd3-dab8181d950a",
        "Identifiant1day": "47545515-2e29-48c6-8dcd-4ead818acdd8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_CTE",
        "VariableId": "5c608485-8abf-4982-846d-560673aa2f07",
        "Identifiant5Min": "90ea864e-7670-4262-be4d-d0b4d32ebb09",
        "Identifiant1h": "987b5d68-2f55-4d5f-9efe-08ce85debe05",
        "Identifiant4h": "3e3da972-6b6f-4d40-bfb1-798465309e1f",
        "Identifiant8h": "908cc53a-c4f2-4368-b067-bcd36866761f",
        "Identifiant1day": "12a2cf5d-1820-4573-9336-ae5625b6727f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_CTE",
        "VariableId": "b1e1d0ce-10a3-4394-bde4-b18183d19f27",
        "Identifiant5Min": "e34702e9-ff75-407a-92a0-d00a8ab2152f",
        "Identifiant1h": "3419622b-31c1-4762-8b17-4810a0838540",
        "Identifiant4h": "6c14ada9-c1ac-4cf9-b87f-c7eedf7c148d",
        "Identifiant8h": "648166d0-519e-4bc0-9a49-b288a2698a04",
        "Identifiant1day": "8cb052a9-4b23-4677-8b46-924d898ac07c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_LDR",
        "VariableId": "ce5fc3a7-09c7-4222-b826-76a276aab28d",
        "Identifiant5Min": "c012d055-73f1-443a-b194-d391e103fc78",
        "Identifiant1h": "64a8e06e-c533-4e36-beb6-cdebf8dce113",
        "Identifiant4h": "38154bbf-63a7-40ff-b1aa-b2373810e67b",
        "Identifiant8h": "dee9ca00-35e6-4515-9170-41cf1c961f0f",
        "Identifiant1day": "ee7f57ab-4e66-4bda-94fd-0d2a57a98c5c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_LDR",
        "VariableId": "6c541bee-6ae7-4100-ae77-0548aa5931d4",
        "Identifiant5Min": "662ffbbe-2fe8-40c2-8d79-d87091b7a074",
        "Identifiant1h": "41c9fc62-ddf7-47fd-8f4e-951e9223d8f7",
        "Identifiant4h": "3f308774-39a1-40e2-ad1e-489e4b409d74",
        "Identifiant8h": "119f71c7-760d-4125-863e-2bf6918d5266",
        "Identifiant1day": "0eb431e7-922c-47ef-98c0-4a42d98355eb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_LDR",
        "VariableId": "c638ca20-e507-42ac-9524-41dab390bc7a",
        "Identifiant5Min": "545fd9d3-013b-4b6b-b487-ed14ebce378f",
        "Identifiant1h": "3ba0ca54-fe91-48d0-b2a6-d07bde8f4a86",
        "Identifiant4h": "84c0ec78-1981-41f6-a246-1f17d9416278",
        "Identifiant8h": "8685a98c-3b82-4d0a-b6c8-fd515b507d44",
        "Identifiant1day": "5f66ca3c-0174-4b2a-95a3-1630e5fa819d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_LDR",
        "VariableId": "868c936e-89dd-4d85-98c2-72cb27bb153c",
        "Identifiant5Min": "d145ec52-cfd1-4983-99eb-648ee35b8317",
        "Identifiant1h": "c3abf3ab-a6af-47cd-b736-763ec3135084",
        "Identifiant4h": "1b36be39-df18-4132-b28d-ec26bb29fe38",
        "Identifiant8h": "a712cf13-0642-45d6-8e39-ee068fe0b023",
        "Identifiant1day": "672da6e1-9cb9-4cad-bb35-aa10f5be1c77"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_LDR",
        "VariableId": "61dbf06c-e578-4c8b-9c64-713e9afd9989",
        "Identifiant5Min": "1b83d993-5e8e-4def-b17f-1352c5717576",
        "Identifiant1h": "7fc20323-718a-4156-8c00-1b855c7aafe7",
        "Identifiant4h": "984d58f8-e3a9-4bb4-9dec-37b215df95b7",
        "Identifiant8h": "cecd6d9e-f49b-4f2f-aec2-932c646302c2",
        "Identifiant1day": "b58ada1d-7301-4415-8570-f0d53125e0e0"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_LDR",
        "VariableId": "1907dabc-a10c-4db8-9bf0-cb69998e5f59",
        "Identifiant5Min": "298341c3-59d8-4c63-93db-3e438609686c",
        "Identifiant1h": "57ebca88-2d3a-4dc3-a496-365ddd95af98",
        "Identifiant4h": "09e27508-d468-4d09-b86e-9d54fb7d78a2",
        "Identifiant8h": "b288b9f4-c197-44c9-b6ee-1a498be8bfa2",
        "Identifiant1day": "5bcbebd0-5ada-48bb-8de9-67f888c90ec5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_LDR",
        "VariableId": "e9fde80f-b366-4c0e-b931-4fcb850548f7",
        "Identifiant5Min": "b9c830e5-dd29-48d1-9a91-f06ac7b99a2f",
        "Identifiant1h": "c933c566-6fa2-44d4-a31a-e825eef77476",
        "Identifiant4h": "85648587-6f8a-4d6f-b54d-3688e5649b30",
        "Identifiant8h": "17706f27-a107-4a94-bf82-45a91a224358",
        "Identifiant1day": "fcecee0e-8ddf-4e47-b8c2-5e1e13b47e63"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_LDR",
        "VariableId": "a6c60b37-136a-4586-b670-51e5c11ce4f7",
        "Identifiant5Min": "e0cf5e2d-8b44-4d16-86ef-239644e4a871",
        "Identifiant1h": "b69aaae0-8017-4c27-8e34-727e6c3cd457",
        "Identifiant4h": "68457d28-0e41-4020-ad32-965ce3b4494f",
        "Identifiant8h": "7c488a75-c3e5-4e14-88a7-7355b3e9e80a",
        "Identifiant1day": "bfa93f1b-6240-44db-afc7-f19b7535dfde"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_FLUO_LT3",
        "VariableId": "61d270b7-160b-415f-bed8-305ad1d84f30",
        "Identifiant5Min": "5a21f19c-44df-40cd-9c1c-c7fc801b89f9",
        "Identifiant1h": "001ca92d-b108-4a23-9fbc-efffd3d3157a",
        "Identifiant4h": "a7f833b5-dce7-4811-b274-cf021ff3555a",
        "Identifiant8h": "466ec129-8c2d-41a9-a301-13ca153e8ea6",
        "Identifiant1day": "eff4d65c-3785-48d1-9ae1-fd36cfe2afa7"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_FLUO_LT3",
        "VariableId": "9e37b54a-95cc-4bda-9a71-57d46c437089",
        "Identifiant5Min": "842eb400-8a34-4fe9-bc7a-6253715bc51f",
        "Identifiant1h": "0c194f63-76f8-452b-9e06-4e211b5132d8",
        "Identifiant4h": "1720f6db-90e6-4b75-bf5f-b847c78ce636",
        "Identifiant8h": "854cab5f-b442-413c-8639-3ee7605da053",
        "Identifiant1day": "db93886c-5f72-4b83-927e-45d351ab1487"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_FLUO_LT3",
        "VariableId": "3605165c-82e9-42fb-85cf-08f3e5357f90",
        "Identifiant5Min": "05e9e66b-6db9-4707-be84-84e399affd28",
        "Identifiant1h": "20bc28fd-acf3-4450-8627-263b2c082398",
        "Identifiant4h": "2d603a79-73ae-4c24-b035-e2bcc5611101",
        "Identifiant8h": "5e068995-3661-45eb-b164-4c19fc9a6784",
        "Identifiant1day": "dd93f607-ec8c-46cb-9152-b525de14f1e7"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_FLUO_LT3",
        "VariableId": "6dc2ab0d-314e-4f3a-84e5-892be00aaa89",
        "Identifiant5Min": "c4d208f4-75a8-4039-b2d5-c344d1bc8331",
        "Identifiant1h": "feccb08a-1d64-48d5-a3c1-2509ce5592bc",
        "Identifiant4h": "c26a6b12-c7a1-449e-be9a-d63b9a3be74a",
        "Identifiant8h": "6348895b-331d-4edc-a631-01626a067ca8",
        "Identifiant1day": "78d8971b-4928-49cf-83a0-5be61ab41016"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_FLUO_LT3",
        "VariableId": "0d4831af-8240-4e94-8489-0cb3ccced8c5",
        "Identifiant5Min": "8e75e981-3e3b-4104-8f9e-6e1c4b9e76c9",
        "Identifiant1h": "84adf397-b1db-4455-9ced-eda8a0db7166",
        "Identifiant4h": "eb44e870-efc1-46bc-948f-dcae3a887781",
        "Identifiant8h": "54f2a544-ed55-4fbb-a246-f45eeb337379",
        "Identifiant1day": "d1ba85ca-e95f-488c-85d0-858c44eae41a"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_FLUO_LT3",
        "VariableId": "e2cddadb-5648-4714-a80b-044e778386d7",
        "Identifiant5Min": "96765477-1c0c-4e18-8a0b-3286cacec92d",
        "Identifiant1h": "e79aeec9-7170-4190-b4bc-049410c2d654",
        "Identifiant4h": "04504296-df4a-4432-b734-030e54ea1d3f",
        "Identifiant8h": "ba5cc12a-6b2e-41cf-a4bd-32725f801341",
        "Identifiant1day": "3df430e5-d20c-4e62-b2b4-dc549e56f1cd"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_FLUO_LT3",
        "VariableId": "e474c6da-c11b-4032-93f8-be1d9811bde7",
        "Identifiant5Min": "49eed80b-71f1-4bc0-bb37-ada770546b16",
        "Identifiant1h": "58915e1e-bb49-4cba-b60d-2a64710a232f",
        "Identifiant4h": "329b1baf-6d48-4753-a336-856d7fe948de",
        "Identifiant8h": "0576e62d-392f-49f8-9c24-e1025ec69413",
        "Identifiant1day": "961f0cc7-d755-4ac9-aa3f-5ea87b5ae69b"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_FLUO_LT3",
        "VariableId": "c3eb76a6-4997-418e-9422-b4e76ed1e3fa",
        "Identifiant5Min": "3a3c370b-ccf0-49fa-812c-2a538851f590",
        "Identifiant1h": "9357063a-e445-4ad9-bc08-ff599fe59668",
        "Identifiant4h": "216ef555-b598-4cb8-b115-7a4c976c7aae",
        "Identifiant8h": "7c48f254-fa3b-4912-ab28-fe02644fa938",
        "Identifiant1day": "9fbe0822-e574-4a39-b873-fa36c69b5780"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_TDS_CHAUDIERE",
        "VariableId": "2cfbf88f-2e31-4dbf-9c28-b6993c89fb86",
        "Identifiant5Min": "3c1c25f1-0f7e-466e-a334-4ed479898633",
        "Identifiant1h": "5c148f92-618b-413e-95ae-3f96e1652c59",
        "Identifiant4h": "31a2fcaa-8611-49f1-8759-f247a134cbbf",
        "Identifiant8h": "393cba07-360c-48db-9e3a-9fb54f49d7bb",
        "Identifiant1day": "b3b85dfb-a2a2-4210-be55-09a9920e3187"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_TDS_CHAUDIERE",
        "VariableId": "68964983-fc87-42d5-9a47-74f8aef4aacd",
        "Identifiant5Min": "163d6334-2095-4a95-a0da-86e259a12747",
        "Identifiant1h": "e11fab03-f30b-40f1-a7de-3ee8a9024cb1",
        "Identifiant4h": "4bb307bc-1223-42f9-bc19-924f4d05553c",
        "Identifiant8h": "a78aa407-c28b-4af4-a86a-188229983393",
        "Identifiant1day": "3055e49a-53a6-4290-8568-062b5aacb253"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_TDS_CHAUDIERE",
        "VariableId": "71b6c576-8168-40a2-8975-75c389c24f8f",
        "Identifiant5Min": "1a1eeab6-5f99-43b3-b1cd-acb7f9a9fd69",
        "Identifiant1h": "9209ed83-3b35-407e-a482-cbb23223ad80",
        "Identifiant4h": "0f39ad8e-4b0c-4815-854b-22897b9cead4",
        "Identifiant8h": "7b58c06b-6b39-4236-bdc0-f14230f5ec26",
        "Identifiant1day": "16d1700b-8066-4d14-b0d8-c7f754c34590"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_TDS_CHAUDIERE",
        "VariableId": "0ab88773-06fd-4609-a0a0-f5497ae0a0be",
        "Identifiant5Min": "8036b988-ffc2-4580-9404-0aaa1292ce88",
        "Identifiant1h": "816e240c-e7bb-4d42-852b-6289aee1f277",
        "Identifiant4h": "0d87de74-12a5-4042-9361-be450dd5765c",
        "Identifiant8h": "336ad661-52ea-4083-bf15-3a3d9cd62f14",
        "Identifiant1day": "5a0ce125-7e71-4219-9f1b-02363ab7f823"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_TDS_CHAUDIERE",
        "VariableId": "2a7593e4-5a5d-4a39-9cde-768a64ab259d",
        "Identifiant5Min": "cbae8d37-e366-4f16-826a-364c0ff25b2d",
        "Identifiant1h": "d2dc3e1d-1a8e-47b3-b3eb-abe79283f402",
        "Identifiant4h": "713c347d-476e-4306-ac7d-037f74c19fb6",
        "Identifiant8h": "8c84f034-dae5-4459-835c-7e757b5e8e89",
        "Identifiant1day": "6edad52d-7c14-4d12-928a-ce70daeed323"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_TDS_CHAUDIERE",
        "VariableId": "380e22cd-bdab-4725-acdc-ca170c3f5ba9",
        "Identifiant5Min": "c4cee8c5-4fa2-46ad-aaaa-d8dce2ac38c0",
        "Identifiant1h": "ddabf33e-ab0a-4e16-b931-e7fddcc68a3f",
        "Identifiant4h": "cc13d535-76ea-4d0e-b971-e5be3ee174ee",
        "Identifiant8h": "3b9fd9eb-a142-437e-9312-c58886322431",
        "Identifiant1day": "a984e726-8be7-426a-af7b-f0aaf2103ceb"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_TDS_CHAUDIERE",
        "VariableId": "1c856ce2-520b-444c-b240-b906850aedd6",
        "Identifiant5Min": "7dad43b3-0f22-4887-aee1-630ce0b2836c",
        "Identifiant1h": "08d04583-5438-4416-ba84-76714694815d",
        "Identifiant4h": "c7057437-b8be-4141-aa4a-3df0d401bff7",
        "Identifiant8h": "35fbb964-c5c0-43e1-b36b-88d8d085b660",
        "Identifiant1day": "d340d7d9-1d05-4cb2-94e7-7156ce8a7a6c"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_TDS_CHAUDIERE",
        "VariableId": "18af6c43-1ad0-4faf-bd4d-5c77886ac6bb",
        "Identifiant5Min": "8bb4f783-b4a6-4711-83d6-b08a71de0bfa",
        "Identifiant1h": "1348e067-52b6-4fe7-8cd9-92daa1c9b36c",
        "Identifiant4h": "166d866a-6acb-4a66-b09f-37e97769b362",
        "Identifiant8h": "97e939f2-c301-4f4d-b60d-4b554ff9ff29",
        "Identifiant1day": "0f0f4faa-aa48-49d6-a36e-43f0bb420c82"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_UVE",
        "VariableId": "de6d658b-2077-4e96-86d1-35cfc04f9ea2",
        "Identifiant5Min": "82506ff1-7931-45af-8bb2-fdfd3a72ad86",
        "Identifiant1h": "72d467f9-830e-43d6-b6ec-700714000ed5",
        "Identifiant4h": "ac3fd46f-af4d-48fe-b8c1-e7024c457c31",
        "Identifiant8h": "ad823e0e-ebe9-4c45-8159-02dd360f8140",
        "Identifiant1day": "97430614-eee7-4dca-a1da-8c5a19b32728"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_UVE",
        "VariableId": "f7d60f8c-56b2-4dd5-8c14-e61401863f6c",
        "Identifiant5Min": "b11ea095-0766-4ab4-8dbd-e26295426ffa",
        "Identifiant1h": "fcb8e5a8-3684-4685-bdeb-9c263b0e4f43",
        "Identifiant4h": "2b30a272-efbe-4608-8feb-b4ecdab9febd",
        "Identifiant8h": "a554d03d-a78b-40b7-80b5-df31357173bc",
        "Identifiant1day": "bfe8f633-24ae-4802-8507-19b4b323a071"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_UVE",
        "VariableId": "e80049e3-41f8-4a7e-95e3-869d88baf899",
        "Identifiant5Min": "5a3d573c-c9a8-4993-b3ed-6a2aca3f6ad7",
        "Identifiant1h": "3f8ac150-d3d7-4066-8264-8795ea82fd81",
        "Identifiant4h": "2ffc143d-1f79-43dc-b8ac-c4ea91c152e2",
        "Identifiant8h": "6e79a9d3-df3a-49b5-9dce-3befc1208137",
        "Identifiant1day": "7d2a4509-f371-46df-bc3c-1089141b9cf8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_UVE",
        "VariableId": "c1bc3a9e-9f75-4436-b32f-b53df24a9207",
        "Identifiant5Min": "67f2e5f6-5f59-4614-9a48-9e58e2af5aff",
        "Identifiant1h": "5fdbbb3e-bc63-458f-b690-33e3be7eb75b",
        "Identifiant4h": "4c50cc20-4f2a-45ad-a03b-79f6126e6db9",
        "Identifiant8h": "634c2c3b-b28a-4040-8b59-96424a5d11c9",
        "Identifiant1day": "94efa5fb-3d28-46d2-97c8-7950de7a556d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_UVE",
        "VariableId": "017f99b0-0eb6-4b98-a959-efe0320a0c91",
        "Identifiant5Min": "6db366e5-7104-43f2-bf17-aa736e2625cd",
        "Identifiant1h": "b6ac6cae-733c-46ec-8795-02cb02825fdf",
        "Identifiant4h": "6140c941-f6cd-4b22-b9d9-8bba82cfa721",
        "Identifiant8h": "a60f05ad-042e-460d-9b9c-772700201d04",
        "Identifiant1day": "07e9804f-2592-4f7e-b685-5b0e2d32fc68"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_UVE",
        "VariableId": "564f680c-db45-44f7-a2fe-200903cbd9f1",
        "Identifiant5Min": "dea2ca18-c77d-4b69-9a1e-d5333ffa95bc",
        "Identifiant1h": "34505ab9-c739-4ff6-b8d7-6b733775e80b",
        "Identifiant4h": "925800af-bc62-440d-8055-63180b06f845",
        "Identifiant8h": "42f06b3c-059b-4966-87a1-e08876eb1d58",
        "Identifiant1day": "ff895d08-aa38-46d2-9739-64555fde5e56"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_UVE",
        "VariableId": "c18eab0d-44a6-4281-b432-56e2fb17275f",
        "Identifiant5Min": "701e0492-00f3-4707-af4f-bdbfa680cec0",
        "Identifiant1h": "90fb99b2-59be-46e0-a63c-04b058f4fbab",
        "Identifiant4h": "47c67937-d8d4-4880-9ef9-128654c78b14",
        "Identifiant8h": "1822313b-193d-4e86-b0b5-534cae78f4c4",
        "Identifiant1day": "5b9399dc-7879-4d72-867a-74463455b26d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_UVE",
        "VariableId": "d60a26dc-4733-4c38-af25-542561f0b10c",
        "Identifiant5Min": "eb98a38e-6276-44f0-adca-c4c63202e22e",
        "Identifiant1h": "e18551d6-3eaf-4bc2-832b-c815f7db3b65",
        "Identifiant4h": "cd30fa9c-b4c0-4857-9036-82a087bba843",
        "Identifiant8h": "3b8f27ea-9a64-4f5b-bf19-a9f3a5dcd2db",
        "Identifiant1day": "7a461e35-ccf9-4cb5-a291-dce5c9e58950"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_elec_CHAUDIERE",
        "VariableId": "4ff4ab93-d72c-494a-8fa1-39bd24eddd5d",
        "Identifiant5Min": "d010b9c5-8657-45b1-a376-18b678fd3891",
        "Identifiant1h": "c6939275-f534-461d-921b-50be443c250f",
        "Identifiant4h": "f7be9371-3298-4d83-88cf-b8247628daaf",
        "Identifiant8h": "9019eca0-2f51-417c-a7ab-73f58c2a8661",
        "Identifiant1day": "6dc414cc-6711-4ad5-a983-ba273832a576"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_elec_CHAUDIERE",
        "VariableId": "349f8f63-4308-46b3-a607-8d730907c3a7",
        "Identifiant5Min": "67af4240-bb75-44ae-941a-b2419d7e7af7",
        "Identifiant1h": "ecdf7a65-e369-4a72-bdd4-6756176209e6",
        "Identifiant4h": "a9e2763f-bafd-4142-b7e2-c3dbc82b4bd9",
        "Identifiant8h": "92b99a5b-e2b6-4a3e-932e-424fc5c70c3b",
        "Identifiant1day": "0190104b-ef1f-4837-813c-04a8e4c7bdd8"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_eau_CHAUDIERE",
        "VariableId": "648be1f8-2366-43d6-becc-400f88a2db9d",
        "Identifiant5Min": "8e869ad5-eb0b-4eca-aacd-3c972ff9ccca",
        "Identifiant1h": "8b28ef0f-e1a6-41aa-8b67-3c5950a0306a",
        "Identifiant4h": "0386fe80-65d3-426a-8ea2-8c38efe24518",
        "Identifiant8h": "ea4a034a-7057-4b91-8c98-95a2f6a9989a",
        "Identifiant1day": "9e9fde2e-b366-49e1-ac46-a1d5f89fffc7"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_eau_CHAUDIERE",
        "VariableId": "26b55e48-2786-41bb-a7cb-f1151e91ee65",
        "Identifiant5Min": "5ac2a538-34f0-426d-8a85-f7e92ddfe848",
        "Identifiant1h": "5aefdb1e-3f0f-4c53-93f1-0a4217241862",
        "Identifiant4h": "27f2803d-9f97-4663-9f8a-3e45e0c286a3",
        "Identifiant8h": "b2e76231-abc6-4c90-ac42-71a2cc01deba",
        "Identifiant1day": "2538cf8e-b587-4ebb-b146-b1b5d9b7197d"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_air_CHAUDIERE",
        "VariableId": "13efce30-a65a-4f30-b18f-84fb8161493a",
        "Identifiant5Min": "437d0c75-2db1-4874-ae96-31819ddcfef4",
        "Identifiant1h": "ebb77a31-fd01-4c34-9b44-30d9579b2999",
        "Identifiant4h": "296dcc8e-5bf6-48e6-9678-394ea493c6da",
        "Identifiant8h": "2de65a92-68ca-417b-8cf9-591e5fb5163a",
        "Identifiant1day": "d33b7737-ffd6-49a1-bbca-43e2cf34cd2f"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_air_CHAUDIERE",
        "VariableId": "1b3444ee-f3be-4317-8821-2e2bf02bafbc",
        "Identifiant5Min": "170642ac-3c4a-4486-ad27-dd0e64750c02",
        "Identifiant1h": "7093abea-a508-4c37-83a1-8c48735a3924",
        "Identifiant4h": "db83c01f-50aa-4b16-8bab-9e534b65faf3",
        "Identifiant8h": "bc55aa5c-36a9-4b1e-bc7e-20fad3128b2d",
        "Identifiant1day": "d96b6713-8d60-4331-b68b-b700c3bc96a9"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_gaz_CHAUDIERE",
        "VariableId": "376ea13b-e1d2-4d14-a454-3751f4faba57",
        "Identifiant5Min": "01c1170d-e69d-4257-be8d-647ca7d654d9",
        "Identifiant1h": "816f647a-78a0-41b2-b0ab-fbfd341d7a62",
        "Identifiant4h": "a393e60e-b440-4d17-80f9-8fad55ea9921",
        "Identifiant8h": "2f8c23f9-9c98-4f56-9de0-2e9146ded93a",
        "Identifiant1day": "a564b171-b63d-4114-a1be-bf5f813aafe5"
      }
    },
    {
      "attributes": {
        "VariableName": "IPE_kg_gaz_CHAUDIERE",
        "VariableId": "aade2ae8-9cf7-47bc-9106-c87bf18975c6",
        "Identifiant5Min": "1c4db6c4-2f70-48fd-8777-a66029e800aa",
        "Identifiant1h": "4f5ff896-4a22-4887-a8b4-6dec80c68cce",
        "Identifiant4h": "744cd8b0-2acf-4797-a0c1-589eeec68c8c",
        "Identifiant8h": "d6a4b5ed-e033-4dee-878e-b77c80d8d91f",
        "Identifiant1day": "6885701a-9d04-4412-8af0-208d80079dc7"
      }
    }
  ]
};

  // Suppression des objets existants
  let deletedCount = 0;
  const entityPrefixes = [
    'Smart.Aggregation_IPE_quantite_',
    'Smart.Aggregation_IPE_kg_'
  ];
  for (const prefix of entityPrefixes) {
    // On suppose que les entités sont connues dans le modèle Mendix
    // Remplacez la logique ci-dessous si besoin pour filtrer par contexte
    const entities = Object.keys(MENDIX_SUMMARY).filter(k => k.startsWith(prefix));
    for (const key of entities) {
      const arr = MENDIX_SUMMARY[key];
      for (const obj of arr) {
        await new Promise((resolve, reject) => {
          mx.data.get({
            entity: obj.entity,
            callback: function(objs) {
              if (objs && objs.length > 0) {
                mx.data.remove({
                  guids: objs.map(o => o.getGuid()),
                  callback: function() {
                    deletedCount += objs.length;
                    resolve();
                  },
                  error: function() {
                    resolve(); // On continue même en cas d'erreur
                  }
                });
              } else {
                resolve();
              }
            },
            error: function() { resolve(); }
          });
        });
      }
    }
  }
  console.log('Objets supprimés :', deletedCount);

  // Création des nouveaux objets
  let createdCount = 0;
  for (const key of Object.keys(MENDIX_SUMMARY)) {
    const arr = MENDIX_SUMMARY[key];
    for (const obj of arr) {
      await new Promise((resolve, reject) => {
        mx.data.create({
          entity: obj.entity,
          callback: function(mxObj) {
            // On set tous les attributs
            for (const attr in obj.attributes) {
              mxObj.set(attr, obj.attributes[attr]);
            }
            mx.data.commit({
              mxobj: mxObj,
              callback: function() {
                createdCount++;
                resolve();
              },
              error: function() { resolve(); }
            });
          },
          error: function() { resolve(); }
        });
      });
    }
  }
  console.log('Objets créés :', createdCount);

  // Résumé final
  console.log('Résumé :', { deletedCount, createdCount });
  // END USER CODE
}
