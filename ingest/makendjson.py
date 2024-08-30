# load all data into a pandas dataframe
# remove first 4 columns

import pandas as pd
import pandas as pd
from tqdm import tqdm


def load_data(file_path):
    with open(file_path) as f:
        # tsv file
        df = pd.concat([chunk for chunk in tqdm(pd.read_csv(f, sep='\t', chunksize=10000), desc='Loading data')])
        return df.iloc[:, 4:]

# save the data as ndjson file
def save_data(df, file_path):
    df.to_json(file_path, orient='records', lines=True)

# load tsv file /tmp/works

dataloaded = load_data('/tmp/works')
print(dataloaded.head())
save_data(dataloaded, '/tmp/works.ndjson')