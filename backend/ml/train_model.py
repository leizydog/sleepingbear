import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score, roc_curve
)
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import json
from datetime import datetime
import os

class RetentionPredictor:
    def __init__(self, data_path='data/retention_training_data.csv'):
        """Initialize the retention predictor"""
        self.data_path = data_path
        self.models = {}
        self.scaler = StandardScaler()
        self.feature_names = []
        self.results = {}
        
    def load_data(self):
        """Load and prepare the training data"""
        print("Loading data...")
        df = pd.read_csv(self.data_path)
        
        print(f"Dataset shape: {df.shape}")
        print(f"Features: {df.columns.tolist()}")
        
        # Separate features and target
        if 'user_id' in df.columns:
            df = df.drop('user_id', axis=1)
        
        X = df.drop('retained', axis=1)
        y = df['retained']
        
        self.feature_names = X.columns.tolist()
        
        print(f"\nClass distribution:")
        print(f"Retained (1): {sum(y == 1)} ({sum(y == 1) / len(y) * 100:.1f}%)")
        print(f"Churned (0): {sum(y == 0)} ({sum(y == 0) / len(y) * 100:.1f}%)")
        
        return X, y
    
    def preprocess_data(self, X, y):
        """Split and scale the data"""
        print("\nSplitting data...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"Training set: {X_train.shape[0]} samples")
        print(f"Test set: {X_test.shape[0]} samples")
        
        # Scale features
        print("Scaling features...")
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        return X_train_scaled, X_test_scaled, y_train, y_test
    
    def train_logistic_regression(self, X_train, y_train):
        """Train Logistic Regression model"""
        print("\n" + "="*50)
        print("Training Logistic Regression...")
        print("="*50)
        
        # Hyperparameter tuning
        param_grid = {
            'C': [0.001, 0.01, 0.1, 1, 10, 100],
            'penalty': ['l2'],
            'solver': ['lbfgs'],
            'max_iter': [1000]
        }
        
        lr = LogisticRegression(random_state=42)
        grid_search = GridSearchCV(
            lr, param_grid, cv=5, scoring='f1', n_jobs=-1, verbose=1
        )
        grid_search.fit(X_train, y_train)
        
        print(f"Best parameters: {grid_search.best_params_}")
        print(f"Best cross-validation F1 score: {grid_search.best_score_:.4f}")
        
        self.models['logistic_regression'] = grid_search.best_estimator_
        return grid_search.best_estimator_
    
    def train_random_forest(self, X_train, y_train):
        """Train Random Forest model"""
        print("\n" + "="*50)
        print("Training Random Forest...")
        print("="*50)
        
        # Hyperparameter tuning
        param_grid = {
            'n_estimators': [50, 100, 200],
            'max_depth': [5, 10, 15, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4],
            'max_features': ['sqrt', 'log2']
        }
        
        rf = RandomForestClassifier(random_state=42)
        grid_search = GridSearchCV(
            rf, param_grid, cv=5, scoring='f1', n_jobs=-1, verbose=1
        )
        grid_search.fit(X_train, y_train)
        
        print(f"Best parameters: {grid_search.best_params_}")
        print(f"Best cross-validation F1 score: {grid_search.best_score_:.4f}")
        
        self.models['random_forest'] = grid_search.best_estimator_
        return grid_search.best_estimator_
    
    def train_svm(self, X_train, y_train):
        """Train SVM model"""
        print("\n" + "="*50)
        print("Training SVM...")
        print("="*50)
        
        # Hyperparameter tuning
        param_grid = {
            'C': [0.1, 1, 10, 100],
            'kernel': ['rbf', 'linear'],
            'gamma': ['scale', 'auto']
        }
        
        svm = SVC(random_state=42, probability=True)
        grid_search = GridSearchCV(
            svm, param_grid, cv=5, scoring='f1', n_jobs=-1, verbose=1
        )
        grid_search.fit(X_train, y_train)
        
        print(f"Best parameters: {grid_search.best_params_}")
        print(f"Best cross-validation F1 score: {grid_search.best_score_:.4f}")
        
        self.models['svm'] = grid_search.best_estimator_
        return grid_search.best_estimator_
    
    def evaluate_model(self, model, model_name, X_test, y_test):
        """Evaluate a trained model"""
        print(f"\n{'='*50}")
        print(f"Evaluating {model_name}...")
        print(f"{'='*50}")
        
        # Make predictions
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        
        print(f"Accuracy:  {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall:    {recall:.4f}")
        print(f"F1 Score:  {f1:.4f}")
        
        if y_pred_proba is not None:
            auc = roc_auc_score(y_test, y_pred_proba)
            print(f"AUC-ROC:   {auc:.4f}")
        else:
            auc = None
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        print(f"\nConfusion Matrix:")
        print(cm)
        
        # Store results
        self.results[model_name] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'auc_roc': auc,
            'confusion_matrix': cm.tolist(),
            'classification_report': classification_report(y_test, y_pred)
        }
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'auc_roc': auc
        }
    
    def plot_confusion_matrix(self, model_name, cm, save_path='backend/ml/plots'):
        """Plot confusion matrix"""
        os.makedirs(save_path, exist_ok=True)
        
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                    xticklabels=['Churned', 'Retained'],
                    yticklabels=['Churned', 'Retained'])
        plt.title(f'Confusion Matrix - {model_name}')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        plt.savefig(f'{save_path}/{model_name}_confusion_matrix.png')
        plt.close()
        print(f"Confusion matrix saved to {save_path}/{model_name}_confusion_matrix.png")
    
    def plot_roc_curve(self, models_data, save_path='backend/ml/plots'):
        """Plot ROC curves for all models"""
        os.makedirs(save_path, exist_ok=True)
        
        plt.figure(figsize=(10, 8))
        
        for model_name, data in models_data.items():
            if data['y_pred_proba'] is not None:
                fpr, tpr, _ = roc_curve(data['y_test'], data['y_pred_proba'])
                auc = roc_auc_score(data['y_test'], data['y_pred_proba'])
                plt.plot(fpr, tpr, label=f'{model_name} (AUC = {auc:.3f})')
        
        plt.plot([0, 1], [0, 1], 'k--', label='Random Classifier')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('ROC Curves Comparison')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(f'{save_path}/roc_curves_comparison.png')
        plt.close()
        print(f"ROC curves saved to {save_path}/roc_curves_comparison.png")
    
    def plot_feature_importance(self, model, model_name, save_path='backend/ml/plots'):
        """Plot feature importance (for Random Forest)"""
        if model_name != 'random_forest':
            return
        
        os.makedirs(save_path, exist_ok=True)
        
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1]
        
        plt.figure(figsize=(12, 8))
        plt.title(f'Feature Importance - {model_name}')
        plt.bar(range(len(importances)), importances[indices])
        plt.xticks(range(len(importances)), 
                   [self.feature_names[i] for i in indices], 
                   rotation=45, ha='right')
        plt.xlabel('Features')
        plt.ylabel('Importance')
        plt.tight_layout()
        plt.savefig(f'{save_path}/{model_name}_feature_importance.png')
        plt.close()
        print(f"Feature importance saved to {save_path}/{model_name}_feature_importance.png")
    
    def compare_models(self):
        """Compare all trained models"""
        print("\n" + "="*50)
        print("MODEL COMPARISON")
        print("="*50)
        
        comparison_df = pd.DataFrame(self.results).T
        print("\n", comparison_df[['accuracy', 'precision', 'recall', 'f1_score', 'auc_roc']])
        
        # Find best model based on F1 score
        best_model_name = max(self.results.items(), 
                             key=lambda x: x[1]['f1_score'])[0]
        print(f"\n🏆 Best Model: {best_model_name}")
        print(f"   F1 Score: {self.results[best_model_name]['f1_score']:.4f}")
        
        return best_model_name
    
    def save_model(self, model_name, save_dir='backend/ml/models'):
        """Save the trained model and scaler"""
        os.makedirs(save_dir, exist_ok=True)
        
        model = self.models[model_name]
        
        # Save model
        model_path = f'{save_dir}/{model_name}_model.pkl'
        joblib.dump(model, model_path)
        print(f"\nModel saved to {model_path}")
        
        # Save scaler
        scaler_path = f'{save_dir}/scaler.pkl'
        joblib.dump(self.scaler, scaler_path)
        print(f"Scaler saved to {scaler_path}")
        
        # Save feature names
        features_path = f'{save_dir}/feature_names.json'
        with open(features_path, 'w') as f:
            json.dump(self.feature_names, f)
        print(f"Feature names saved to {features_path}")
        
        # Save model metadata
        metadata = {
            'model_name': model_name,
            'model_type': type(model).__name__,
            'training_date': datetime.now().isoformat(),
            'feature_count': len(self.feature_names),
            'features': self.feature_names,
            'performance': self.results[model_name],
            'best_params': model.get_params() if hasattr(model, 'get_params') else {}
        }
        
        metadata_path = f'{save_dir}/{model_name}_metadata.json'
        with open(metadata_path, 'w') as f:
            # Convert numpy types to Python types for JSON serialization
            def convert_numpy(obj):
                if isinstance(obj, np.integer):
                    return int(obj)
                elif isinstance(obj, np.floating):
                    return float(obj)
                elif isinstance(obj, np.ndarray):
                    return obj.tolist()
                return obj
            
            json.dump(metadata, f, indent=2, default=convert_numpy)
        print(f"Metadata saved to {metadata_path}")
        
        return model_path, scaler_path, metadata_path
    
    def train_all(self):
        """Complete training pipeline"""
        print("\n" + "="*50)
        print("RETENTION PREDICTION MODEL TRAINING")
        print("="*50)
        
        # Load data
        X, y = self.load_data()
        
        # Preprocess
        X_train, X_test, y_train, y_test = self.preprocess_data(X, y)
        
        # Train models
        lr_model = self.train_logistic_regression(X_train, y_train)
        rf_model = self.train_random_forest(X_train, y_train)
        svm_model = self.train_svm(X_train, y_train)
        
        # Evaluate models
        models_data = {}
        
        for model_name, model in self.models.items():
            metrics = self.evaluate_model(model, model_name, X_test, y_test)
            
            # Get predictions for ROC curve
            y_pred = model.predict(X_test)
            y_pred_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None
            
            models_data[model_name] = {
                'y_test': y_test,
                'y_pred': y_pred,
                'y_pred_proba': y_pred_proba
            }
            
            # Plot confusion matrix
            cm = confusion_matrix(y_test, y_pred)
            self.plot_confusion_matrix(model_name, cm)
            
            # Plot feature importance (for RF)
            self.plot_feature_importance(model, model_name)
        
        # Plot ROC curves
        self.plot_roc_curve(models_data)
        
        # Compare models
        best_model = self.compare_models()
        
        # Save best model
        self.save_model(best_model)
        
        print("\n" + "="*50)
        print("TRAINING COMPLETE!")
        print("="*50)
        
        return best_model, self.models[best_model]


def main():
    """Main training function"""
    # Initialize predictor
    predictor = RetentionPredictor()
    
    # Train all models and get best one
    best_model_name, best_model = predictor.train_all()
    
    print(f"\n✅ Best model ({best_model_name}) is ready for deployment!")
    print(f"📊 Check the plots in 'backend/ml/plots/' for visualizations")
    print(f"💾 Model files saved in 'backend/ml/models/'")


if __name__ == "__main__":
    main()