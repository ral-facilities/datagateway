from icat.client import Client

client = Client(
    "https://localhost:8181",
    checkCert=False,
)
client.login("simple", {"username": "root", "password": "pw"})

public_tables = [
    "Instrument",
    "ParameterType",
    "InvestigationType",
    "DatasetType",
    "SampleType",
    "DatafileFormat",
    "Facility",
    "FacilityCycle",
]

client.createRules("R", public_tables)

public_steps = [
    ("Datafile", "dataset"),
    ("Dataset", "investigation"),
    ("Sample", "investigation"),
    ("Instrument", "instrumentScientists"),
    ("Investigation", "investigationFacilityCycles"),
    ("InstrumentScientist", "user"),
    ("Investigation", "publications"),
    ("Sample", "type"),
    ("InvestigationUser", "user"),
    ("Investigation", "investigationUsers"),
    ("Investigation", "investigationInstruments"),
    ("Dataset", "sample"),
    ("Dataset", "datafiles"),
    ("Investigation", "datasets"),
    ("Investigation", "samples"),
    ("Sample", "parameters"),
    ("Investigation", "parameters"),
    ("Dataset", "parameters"),
    ("Datafile", "parameters"),
]

public_step_objects = []

for step in public_steps:
    ps = client.new("PublicStep", origin=step[0], field=step[1])
    public_step_objects.append(ps)

client.createMany(public_step_objects)
