from icat.client import Client

client = Client(
    "https://localhost:8181",
    checkCert=False,
)
client.login("simple", {username: "root", password: "pw"})

data_publication_type = client.new("dataPublicationType")
data_publication_type.name = "User-defined"
data_publication_type.description = "User-defined"
data_publication_type.facility = client.get("Facility", 1)
data_publication_type.create()
