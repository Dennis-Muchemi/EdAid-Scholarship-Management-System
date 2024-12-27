import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Grid,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import PropTypes from 'prop-types';

const steps = ['Personal Information', 'Academic Details', 'Financial Information', 'Documents', 'Review'];

const validationSchema = Yup.object({
  personalInfo: Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    address: Yup.string().required('Address is required')
  }),
  academicInfo: Yup.object({
    institution: Yup.string().required('Institution name is required'),
    major: Yup.string().required('Field of study is required'),
    gpa: Yup.number().min(0).max(4).required('GPA is required'),
    expectedGraduation: Yup.date().required('Expected graduation date is required')
  }),
  financialInfo: Yup.object({
    annualIncome: Yup.number().required('Annual income is required'),
    otherScholarships: Yup.boolean(),
    otherScholarshipAmount: Yup.number().when('otherScholarships', {
      is: true,
      then: Yup.number().required('Please specify other scholarship amounts')
    })
  })
});

const ApplicationForm = ({ scholarshipId, onSubmit, initialValues }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState({});

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  const handleFileChange = (event, fieldName) => {
    setFiles({
      ...files,
      [fieldName]: event.target.files[0]
    });
  };

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('application', JSON.stringify(values));
      Object.keys(files).forEach(key => {
        formData.append(key, files[key]);
      });

      await onSubmit(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step, formikProps) => {
    const { values, touched, errors, handleChange } = formikProps;

    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="personalInfo.firstName"
                value={values.personalInfo.firstName}
                onChange={handleChange}
                error={touched.personalInfo?.firstName && Boolean(errors.personalInfo?.firstName)}
                helperText={touched.personalInfo?.firstName && errors.personalInfo?.firstName}
              />
            </Grid>
            {/* Add other personal info fields */}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Institution"
                name="academicInfo.institution"
                value={values.academicInfo.institution}
                onChange={handleChange}
                error={touched.academicInfo?.institution && Boolean(errors.academicInfo?.institution)}
                helperText={touched.academicInfo?.institution && errors.academicInfo?.institution}
              />
            </Grid>
            {/* Add other academic info fields */}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Annual Income"
                name="financialInfo.annualIncome"
                type="number"
                value={values.financialInfo.annualIncome}
                onChange={handleChange}
                error={touched.financialInfo?.annualIncome && Boolean(errors.financialInfo?.annualIncome)}
                helperText={touched.financialInfo?.annualIncome && errors.financialInfo?.annualIncome}
              />
            </Grid>
            {/* Add other financial info fields */}
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'transcript')}
                accept=".pdf,.doc,.docx"
              />
            </Grid>
            {/* Add other document upload fields */}
          </Grid>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6">Review your application</Typography>
            <pre>{JSON.stringify(values, null, 2)}</pre>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <Form>
            {renderStepContent(activeStep, formikProps)}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Next
                </Button>
              ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting || !formikProps.isValid}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                )}
            </Box>
          </Form>
        )}
      </Formik>

      <Dialog
        open={isSubmitting}
        aria-labelledby="saving-dialog-title"
      >
        <DialogTitle id="saving-dialog-title">
          Saving your application...
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

ApplicationForm.propTypes = {
  scholarshipId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    personalInfo: PropTypes.object,
    academicInfo: PropTypes.object,
    financialInfo: PropTypes.object
  })
};

ApplicationForm.defaultProps = {
  initialValues: {
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: ''
    },
    academicInfo: {
      institution: '',
      major: '',
      gpa: '',
      expectedGraduation: ''
    },
    financialInfo: {
      annualIncome: '',
      otherScholarships: false,
      otherScholarshipAmount: ''
    }
  }
};

export default ApplicationForm;