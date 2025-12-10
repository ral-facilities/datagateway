from icat.client import Client

client = Client(
    "https://localhost:8181",
    checkCert=False,
)
client.login("simple", {"username": "root", "password": "pw"})

data_publication_type_1 = client.new("dataPublicationType")
data_publication_type_1.name = "User-defined"
data_publication_type_1.description = "User-defined"
data_publication_type_1.facility = client.get("Facility", 1)
data_publication_type_1.create()

data_publication_type_2 = client.new("dataPublicationType")
data_publication_type_2.name = "Investigation"
data_publication_type_2.description = "Investigation"
data_publication_type_2.facility = client.get("Facility", 1)
data_publication_type_2.create()