import React, { useState } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  IconButton,
  Paper,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive'),
  deadline: Yup.date()
    .required('Deadline is required')
    .min(new Date(), 'Deadline cannot be in the past'),
  category: Yup.string().required('Category is required'),
  eligibilityCriteria: Yup.array().of(
    Yup.string().required('Criterion cannot be empty')
  ),
  requiredDocuments: Yup.array().of(
    Yup.string().required('Document cannot be empty')
  ),
  contactEmail: Yup.string()
    .email('Invalid email address')
    .required('Contact email is required')
});

const ScholarshipForm = ({ initialValues, onSubmit, categories, isEditing }) => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(values);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        {isEditing ? 'Edit Scholarship' : 'Create New Scholarship'}
      </Typography>

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
        {({ values, touched, errors, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="title"
                  label="Scholarship Title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && errors.title}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Description
                </Typography>
                <ReactQuill
                  value={values.description}
                  onChange={(content) => setFieldValue('description', content)}
                  theme="snow"
                />
                {touched.description && errors.description && (
                  <Typography color="error" variant="caption">
                    {errors.description}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="amount"
                  label="Amount"
                  type="number"
                  value={values.amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.amount && Boolean(errors.amount)}
                  helperText={touched.amount && errors.amount}
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Application Deadline"
                  value={values.deadline}
                  onChange={(date) => setFieldValue('deadline', date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={touched.deadline && Boolean(errors.deadline)}
                      helperText={touched.deadline && errors.deadline}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  name="category"
                  label="Category"
                  value={values.category}
                  onChange={handleChange}
                  error={touched.category && Boolean(errors.category)}
                  helperText={touched.category && errors.category}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <FieldArray name="eligibilityCriteria">
                  {({ push, remove }) => (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Eligibility Criteria
                      </Typography>
                      {values.eligibilityCriteria.map((criterion, index) => (
                        <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                          <TextField
                            fullWidth
                            name={`eligibilityCriteria.${index}`}
                            value={criterion}
                            onChange={handleChange}
                            error={
                              touched.eligibilityCriteria?.[index] &&
                              Boolean(errors.eligibilityCriteria?.[index])
                            }
                            helperText={
                              touched.eligibilityCriteria?.[index] &&
                              errors.eligibilityCriteria?.[index]
                            }
                          />
                          <IconButton onClick={() => remove(index)}>
                            <RemoveIcon />
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => push('')}
                      >
                        Add Criterion
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </Grid>

              <Grid item xs={12}>
                <FieldArray name="requiredDocuments">
                  {({ push, remove }) => (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Required Documents
                      </Typography>
                      {values.requiredDocuments.map((document, index) => (
                        <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                          <TextField
                            fullWidth
                            name={`requiredDocuments.${index}`}
                            value={document}
                            onChange={handleChange}
                            error={
                              touched.requiredDocuments?.[index] &&
                              Boolean(errors.requiredDocuments?.[index])
                            }
                            helperText={
                              touched.requiredDocuments?.[index] &&
                              errors.requiredDocuments?.[index]
                            }
                          />
                          <IconButton onClick={() => remove(index)}>
                            <RemoveIcon />
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => push('')}
                      >
                        Add Document
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="contactEmail"
                  label="Contact Email"
                  value={values.contactEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.contactEmail && Boolean(errors.contactEmail)}
                  helperText={touched.contactEmail && errors.contactEmail}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Saving...
                  </>
                ) : (
                  isEditing ? 'Update Scholarship' : 'Create Scholarship'
                )}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

ScholarshipForm.defaultProps = {
  initialValues: {
    title: '',
    description: '',
    amount: '',
    deadline: null,
    category: '',
    eligibilityCriteria: [''],
    requiredDocuments: [''],
    contactEmail: ''
  },
  categories: [],
  isEditing: false
};

export default ScholarshipForm;