import pandas as pd
import numpy as np
import lightgbm as lgb
import joblib
from sklearn.model_selection import train_test_split

def categorize_bp(bp):
    if bp < 120:
        return 'Normal'
    elif 120 <= bp < 130:
        return 'Elevated'
    elif 130 <= bp < 140:
        return 'Stage 1 HTN'
    else:
        return 'Stage 2 HTN'

def train_and_save():
    print("Loading data...")
    train_df = pd.read_csv('train.csv')
    
    print("Feature Engineering...")
    train_df['Heart_Disease_Target'] = train_df['Heart Disease'].map({'Presence': 1, 'Absence': 0})
    train_df['Expected_Max_HR'] = 220 - train_df['Age']
    train_df['HR_Reserve'] = train_df['Expected_Max_HR'] - train_df['Max HR']
    train_df['BP_Category'] = train_df['BP'].apply(categorize_bp)
    
    # Drop target and ID
    X = train_df.drop(columns=['id', 'Heart Disease', 'Heart_Disease_Target'])
    y = train_df['Heart_Disease_Target']
    
    # One-Hot Encoding
    X = pd.get_dummies(X, drop_first=True)
    feature_columns = X.columns.tolist()
    
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Best params from notebook
    best_params = {
        'objective': 'binary',
        'metric': 'auc',
        'learning_rate': 0.10280394168331886,
        'num_leaves': 47,
        'max_depth': 12,
        'feature_fraction': 0.7223568058280699,
        'bagging_fraction': 0.8699632159310635,
        'bagging_freq': 2,
        'min_child_samples': 42,
        'verbose': -1,
        'random_state': 42
    }
    
    print("Training model...")
    dtrain = lgb.Dataset(X_train, label=y_train)
    dval = lgb.Dataset(X_val, label=y_val, reference=dtrain)
    
    final_model = lgb.train(
        best_params,
        dtrain,
        num_boost_round=1000,
        valid_sets=[dtrain, dval],
        callbacks=[
            lgb.early_stopping(stopping_rounds=50, verbose=True),
            lgb.log_evaluation(period=100)
        ]
    )
    
    print("Saving model...")
    joblib.dump(final_model, 'heart_disease_model.pkl')
    joblib.dump(feature_columns, 'feature_columns.pkl')
    print("Model and features saved successfully!")

if __name__ == "__main__":
    train_and_save()
