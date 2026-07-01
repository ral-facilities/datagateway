from icat.client import Client

client = Client(
    "https://localhost:8181",
    checkCert=False,
)
client.login("simple", {"username": "root", "password": "pw"})

data_publication_type_2 = client.new("dataPublicationType")
data_publication_type_2.name = "User-defined-concept"
data_publication_type_2.description = "User-defined-concept"
data_publication_type_2.facility = client.get("Facility", 1)
data_publication_type_2.create()

data_publication_type_2 = client.new("dataPublicationType")
data_publication_type_2.name = "User-defined-version"
data_publication_type_2.description = "User-defined-version"
data_publication_type_2.facility = client.get("Facility", 1)
data_publication_type_2.create()

data_publication_type_3 = client.new("dataPublicationType")
data_publication_type_3.name = "Investigation"
data_publication_type_3.description = "Investigation"
data_publication_type_3.facility = client.get("Facility", 1)
data_publication_type_3.create()
