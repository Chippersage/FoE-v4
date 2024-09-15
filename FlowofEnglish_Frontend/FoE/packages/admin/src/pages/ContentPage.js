import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { HTML5Backend } from 'react-dnd-html5-backend';

// @mui
import {
  Button,
  Card,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Snackbar,
  Stack,
  TextField,
  TextareaAutosize,
  Typography,
} from '@mui/material';
// components
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  createContentWorkflow,
  deleteContents,
  getAllWorkflowsByLevel,
  getProgramLevels,
  getLangs,
  getLaststep,
  runContentWorkflow,
  updateContentWorkflow,
} from '../api';
import Iconify from '../components/iconify';
import { ContentCard } from '../sections/@dashboard/blog';

// ----------------------------------------------------------------------

const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
}));

const StyledTextarea = styled(TextareaAutosize)({
  // Add your custom styles here
  // For example:
  padding: '8px',
  border: '1px solid gray',
  borderRadius: '4px',
  resize: 'vertical',
});

const StyledForm = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginTop: '16px', // Add margin-top between fields
});

const StyledFormRow = styled('div')({
  display: 'flex',
  gap: '16px',
  marginTop: '16px', // Add margin-top between fields
});

const StyledCard = styled(Card)({
  width: '80%',
  margin: '10px auto',
  padding: '20px',
  overflow: 'auto',
  maxHeight: 'calc(100vh - 10px)',
  Button: {
    marginTop: '10px',
  },
});

const StyledSnackbar = styled(Snackbar)`
  background-color: #f44336; /* Change the background color */
  color: #ffffff; /* Change the text color */
  font-weight: bold; /* Change the font weight */
  padding: 16px; /* Some padding */
`;

// ----------------------------------------------------------------------

export default function ContentPage() {
  const { id } = useParams();

  const [open, setOpen] = useState(null);
  const [selected, setSelected] = useState([]);
  const [currentstep, setStep] = useState('');
  const [contents, setContents] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [levels, setlevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showResponseFields, setShowResponseFields] = useState(false);
  const [overrideIntervals, setOverrideIntervals] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');

  const handleToggleResponseFields = () => {
    setShowResponseFields(!showResponseFields);
  };

  const handleToggleOverrideInterval = () => {
    if (overrideIntervals)
      setFormData((prev) => ({
        ...prev,
        content_interval: {},
      }));
    setOverrideIntervals(!overrideIntervals);
  };

  const initialFormData = {
    // Define your initial form data here
    id: '',
    id_Program: id,
    level_id: selectedLevel,
    step: currentstep,
    week_no: '',
    content: '',
    id_language: '',
    responsetype: 'new',
    type: 'message',
    content_interval: {},
    link: '',
    link_label: '',
    variables: [],
    options: [],
    template: '',
    created_at: '',
    updated_at: '',
    deleted_at: '',
    wf_condition: '',
    wf_trigger: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const initialFormErrors = { content_interval: {} };
  const [formErrors, setFormErrors] = useState(initialFormErrors);

  const handleSelectLevel = (event) => {
    setSelectedLevel(event.target.value);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors(initialFormErrors);
  };

  const validateForm = () => {
    const errors = { content_interval: {} };

    if (formData.id_language === '') {
      errors.id_language = 'Language is required';
    }

    if (formData.step === '') {
      errors.step = 'Step is required';
    }
    // Perform form field validations
    if (formData.content.trim() === '' && formData.template === '') {
      errors.template = 'Content is required';
    }

    if (formData.type === 'question' && formData.options.length < 1) {
      errors.type = 'At least one options are required for a question';
    }

    if (overrideIntervals && !formData.content_interval?.days && formData.content_interval?.days !== 0) {
      errors.content_interval.days = 'Please select day';
    }
    if (overrideIntervals && !formData.content_interval?.hours && formData.content_interval?.hours !== 0) {
      errors.content_interval.hours = 'Please select hours';
    }
    if (overrideIntervals && !formData.content_interval?.minutes && formData.content_interval?.minutes !== 0) {
      errors.content_interval.minutes = 'Please select minutes';
    }
    // Add more validations as needed

    return errors;
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setIsEditMode(false);
    setSelectedRow(null);
    setOverrideIntervals(false);
    setShowResponseFields(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleOpenMenu = (event, row) => {
    setOpen(event.currentTarget);
    setSelectedRow(row);
  };

  const handleOptionChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name.startsWith('options')) {
      const optionFieldNameParts = name.split('.');
      const optionIndex = parseInt(optionFieldNameParts[1], 10);

      setFormData((prevFormData) => {
        const updatedOptions = [...prevFormData.options];
        const option = { ...updatedOptions[optionIndex] };

        if (optionFieldNameParts.length === 3) {
          const optionField = optionFieldNameParts[2];
          option[optionField] = type === 'checkbox' ? checked : value;
        } else if (optionFieldNameParts.length === 4 && optionFieldNameParts[2] === 'response') {
          const responseField = optionFieldNameParts[3];
          option.response[responseField] = value;
        }

        updatedOptions[optionIndex] = option;

        return {
          ...prevFormData,
          options: updatedOptions,
        };
      });
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleAddVariable = () => {
    // Create a new variable object with default values
    const newVariable = {
      variable: '',
      value: '',
    };

    // Update the form data by adding the new variable to the variables array
    setFormData((prevFormData) => ({
      ...prevFormData,
      variables: [...prevFormData.variables, newVariable],
    }));
  };

  const handleRemoveOption = (index) => {
    // Update the form data by removing the option at the specified index
    setFormData((prevFormData) => ({
      ...prevFormData,
      options: prevFormData.options.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveVariable = (index) => {
    // Update the form data by removing the variable at the specified index
    setFormData((prevFormData) => ({
      ...prevFormData,
      variables: prevFormData.variables.filter((_, i) => i !== index),
    }));
  };

  const handleAddOption = () => {
    // Create a new option object with default values
    const newOption = {
      content_option: '',
      score: 0,
      hasResponse: false,
      response: {
        responsetype: '',
        tt_workflow_id: '',
      },
    };

    // Update the form data by adding the new option to the options array
    setFormData((prevFormData) => ({
      ...prevFormData,
      options: [
        ...prevFormData.options,
        {
          content_option: '',
          score: 0,
          hasResponse: false,
          response: {
            responsetype: '',
            tt_workflow_id: '',
          },
        },
      ],
    }));
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name.startsWith('options')) {
      // Handle options field changes
      const optionIndex = name.match(/\[(\d+)\]/)[1];
      const optionField = name.match(/\.(.+)/)[1];

      const optionSubField2 = optionField.match(/\.(.+)/)?.[1];

      // console.log('option', optionIndex, optionField, optionSubField2);

      setFormData((prevFormData) => {
        const updatedOptions = [...prevFormData.options];
        const option = updatedOptions[optionIndex];

        if (optionField === 'hasResponse') {
          option[optionField] = checked;
        } else {
          option[optionField] = value;

          if (optionSubField2) {
            option.response[optionSubField2] = value;
          }
        }
        // console.log('option', option);
        return {
          ...prevFormData,
          options: updatedOptions,
          level_id: selectedLevel,
        };
      });
    } else if (name.startsWith('variables')) {
      // console.log('variables', name, value, type, checked);
      // Handle variables field changes
      const variableIndex = name.match(/\[(\d+)\]/)[1];
      const variableField = name.match(/\.(.+)/)[1];

      setFormData((prevFormData) => {
        const updatedVariables = [...prevFormData.variables];
        updatedVariables[variableIndex][variableField] = value;
        // console.log('variables', updatedVariables);
        return {
          ...prevFormData,
          variables: updatedVariables,
        };
      });
    } else if (name.startsWith('content_interval')) {
      const updatedContentInterval = formData.content_interval;
      const intervalField = name.match(/\.(.+)/)[1];
      updatedContentInterval[intervalField] = value;
      setFormData((prevFormData) => ({ ...prevFormData, content_interval: updatedContentInterval }));
    } else {
      // Handle other fields
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: type === 'checkbox' ? checked : value,
        level_id: selectedLevel,
      }));
    }
  };

  const run = async () => {
    try {
      const res = await runContentWorkflow();
      // console.log(res);
      setSuccessMessage('Workflow executed successfully!');
    } catch (error) {
      console.error(error);
      setFailureMessage('Failed to execute the workflow. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length === 1 && Object.keys(errors.content_interval).length === 0) {
      try {
        if (isEditMode) {
          await updateContentWorkflow(formData.id, formData);
        } else {
          await createContentWorkflow(formData);
        }
        // handleClose();
        getAllWorkflowsByLevel(selectedLevel).then((res) => {
          setContents(res);
          toast.success('Workflow updated successfully.');
          setIsOpen(false);
        });
      } catch (error) {
        console.error(error);
        setFailureMessage('Failed to submit the form. Please try again.');
      }
    } else {
      setFormErrors(errors);
    }
  };

  const deleteWorkflow = async () => {
    try {
      const { id } = selectedRow;
      await deleteContents(id);
      getAllWorkflowsByLevel(selectedLevel).then((res) => {
        // console.log(res);
        setContents(res);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (post) => {
    // console.log('Post', post);
    handleCloseMenu();
    setIsEditMode(true);
    setIsOpen(true);

    if (post.responses.length > 0) setShowResponseFields(true);
    if (Object.keys(post.content.content_interval).length > 0) {
      setOverrideIntervals(true);
    } else {
      setOverrideIntervals(false);
    }

    setFormData({
      id: post.id.toString(),
      id_Program: id,
      level_id: selectedLevel,
      step: post.step?.toString(),
      week_no: post.week_no?.toString(),
      wf_condition: post.wf_condition?.toString(),
      wf_trigger: post.wf_trigger?.toString(),
      content: post.content.content,
      content_id: post.content.id?.toString(),
      id_language: post.content.id_language?.toString(),
      type: post.content.type,
      content_interval: post.content.content_interval,
      link: post.content.link || '',
      link_label: post.content.link_label || '',
      template: post.content.template || '',
      created_at: post.content.created_at?.toString(),
      updated_at: post.content.updated_at?.toString(),
      deleted_at: post.content.deleted_at ? post.content.deleted_at.toString() : '',
      responsetype: post.responses.length > 0 ? 'workflow' : '',
      tt_workflow_id: post.responses.length > 0 ? post.responses[0].tt_workflow_id : '',
      contentResponse: showResponseFields,
      variables: post.content.variables
        ? post.content.variables.map((variable) => ({
            variable: variable.var_num?.toString(),
            var_val: variable.var_val,
            type: variable.type,
            data: variable.data,
          }))
        : [],
      options: post.content.options.map((option) => ({
        content_option: option.content_option,
        score: option.score.toString(),
        hasResponse: option.responses ? option.responses.length > 0 : false,

        response:
          option.responses && option.responses.length > 0
            ? {
                responsetype: 'workflow',
                tt_workflow_id: option.responses[0].tt_workflow_id || '',
              }
            : {
                responsetype: '',
                tt_workflow_id: '',
              },
      })),
    });
  };

  useEffect(() => {
    // Fetch level details on component mount
    getProgramLevels(id).then((res) => {
      // console.log(res);
      setlevels(res);
      setSelectedLevel(res[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedLevel) {
      // Fetch Program_name details on component mount
      getAllWorkflowsByLevel(selectedLevel).then((res) => {
        // console.log(res);
        setContents(res);
      });
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (selectedLevel) {
      // Fetch Program_name details on component mount
      getLaststep(id, selectedLevel).then((res) => {
        // console.log(res);
        setStep(Number(res[0].step) + 1);
      });
    }
  }, [selectedLevel]);

  useEffect(() => {
    // Fetch Program_name details on component mount
    getLangs().then((res) => {
      // console.log(res.data);
      setLanguages(res);
    });
  }, []);

  const handleSnackbarClose = () => {
    // Reset success and failure messages when the Snackbar is closed
    setSuccessMessage('');
    setFailureMessage('');
  };
  return (
    <>
      <Helmet>
        <title> Content Page </title>
      </Helmet>

      <Container>
        <DndProvider backend={HTML5Backend}>
          <Grid container xs={12} md={12} sm={12} alignItems="center" justifyContent="space-between">
            <Grid item xs={8} md={8} sm={8}>
              <Stack
                direction="row"
                xs={12}
                md={12}
                sm={12}
                flexDirection="row"
                alignItems="center"
                // justifyContent="space-between"
                mb={5}
                mr={5}
              >
                <Typography variant="h4" gutterBottom>
                  Program Workflows
                </Typography>
                <Button
                  color="info"
                  variant="contained"
                  sx={{ marginLeft: '10px' }}
                  onClick={handleOpen}
                  startIcon={<Iconify icon="eva:plus-fill" />}
                >
                  New Program Content
                </Button>
                <Button
                  color="warning"
                  variant="contained"
                  sx={{ marginLeft: '10px' }}
                  onClick={run}
                  startIcon={<Iconify icon="eva:flash-fill" />}
                >
                  Run Workflow
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={4} md={4} sm={4}>
              <Stack
                direction="row"
                xs={12}
                md={12}
                sm={12}
                flexDirection="row"
                alignItems="right"
                justifyContent="space-between"
                mb={5}
              >
                <FormControl fullWidth variant="outlined" error={!!formErrors.language}>
                  {/* <InputLabel id="level-select-label">Levels</InputLabel> */}
                  <Select
                    labelId="level-select-label"
                    id="language-select"
                    name="level"
                    value={selectedLevel}
                    onChange={handleSelectLevel}
                    label=""
                    sx={{ width: '280px', marginRight: '10px' }}
                  >
                    {levels.map((level) => (
                      <MenuItem key={level.id} value={level.id}>
                        {level.level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>
          <Grid container xs={12} md={12} sm={12} spacing={3} justifyContent="space-between" alignItems="baseline">
            <Grid
              container
              spacing={1}
              xs={12}
              sx={{
                position: 'sticky',
                top: '70px',
                zIndex: 1,
                // height: '100vh-30',
                // overflowY: 'scroll',
              }}
            >
              {contents.length === 0 && (
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    textAlign: 'center',
                    marginTop: '50px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    border: '1px solid #ccc',
                    padding: '10px',
                  }}
                >
                  No Workflows added
                </Typography>
              )}
              {contents.map((post, index) => (
                <ContentCard
                  key={post.id}
                  post={post}
                  index={index}
                  handleEdit={handleEdit}
                  setSelectedRow={setSelectedRow}
                  setIsConfirmOpen={setIsConfirmOpen}
                />
              ))}
            </Grid>
          </Grid>
        </DndProvider>
      </Container>

      <StyledModal open={isOpen} onClose={handleClose}>
        <StyledCard>
          <div>
            <h3>{isEditMode ? `Edit Workflow #${formData.id}` : 'Add Workflow'}</h3>
            <StyledForm noValidate>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    name="content"
                    label="Content /  Step name"
                    value={formData.content}
                    onChange={handleFormChange}
                    multiline
                    minRows={1}
                    maxRows={2}
                    variant="outlined"
                    fullWidth
                    error={!!formErrors.content}
                    helperText={formErrors.content}
                    sx={{ marginBottom: '16px' }}
                  />
                  <StyledFormRow sx={{ marginBottom: '16px' }}>
                    <FormControl fullWidth variant="outlined" error={!!formErrors.language}>
                      <InputLabel id="language-select-label">Language</InputLabel>
                      <Select
                        labelId="language-select-label"
                        id="language-select"
                        name="id_language"
                        value={formData.id_language}
                        onChange={handleFormChange}
                        label="Language"
                        error={!!formErrors.id_language}
                        helperText={formErrors.id_language}
                      >
                        {languages.map((language) => (
                          <MenuItem key={language.id} value={language.id}>
                            {language.language}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.language && <FormHelperText>{formErrors.language}</FormHelperText>}
                    </FormControl>
                    <FormControl fullWidth variant="outlined" error={!!formErrors.type}>
                      <InputLabel id="type-select-label">Type</InputLabel>
                      <Select
                        labelId="type-select-label"
                        id="type-select"
                        name="type"
                        value={formData.type}
                        onChange={handleFormChange}
                        label="Type"
                        error={!!formErrors.type}
                        helperText={formErrors.type}
                      >
                        <MenuItem value="message">Message</MenuItem>
                        <MenuItem value="question">Question</MenuItem>
                        <MenuItem value="assessment">Assessment</MenuItem>
                      </Select>
                      {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                    </FormControl>
                  </StyledFormRow>
                  <StyledFormRow sx={{ marginBottom: '16px' }}>
                    <TextField
                      name="step"
                      label="Step"
                      value={formData.step}
                      onChange={handleFormChange}
                      variant="outlined"
                      error={!!formErrors.step}
                      helperText={formErrors.step}
                      sx={{ width: '50%' }}
                    />
                    <TextField
                      name="week_no"
                      label="Week No"
                      value={formData.week_no}
                      onChange={handleFormChange}
                      variant="outlined"
                      error={!!formErrors.week_no}
                      helperText={formErrors.week_no}
                      sx={{ width: '50%' }}
                    />
                    <div style={{ width: '50%' }}>
                      <TextField
                        name="template"
                        label="Template"
                        value={formData.template}
                        onChange={handleFormChange}
                        variant="outlined"
                        error={!!formErrors.template}
                        helperText={formErrors.template}
                        fullWidth
                      />
                      <FormHelperText sx={{ marginBottom: '16px' }}>facebook templates</FormHelperText>
                    </div>
                  </StyledFormRow>
                  <Stack direction="row" alignItems="center" sx={{ my: 2 }}>
                    <Checkbox checked={overrideIntervals} onClick={handleToggleOverrideInterval} /> Override Intervals
                  </Stack>
                  {overrideIntervals && (
                    <>
                      <Typography variant="h6" sx={{ marginTop: 2 }}>
                        Lesson/Quiz Reminder Interval*
                      </Typography>
                      <Typography variant="body2">
                        * Lesson interval is relative to enrollment day. Quiz reminder is interval before the upcoming
                        quiz.
                      </Typography>
                      <StyledFormRow sx={{ marginBottom: '16px' }}>
                        <FormControl fullWidth variant="outlined" error={!!formErrors.content_interval.days}>
                          <InputLabel id="content-interval-days-select-label">Days</InputLabel>
                          <Select
                            labelId="content-interval-days-select-label"
                            id="content-interval-days-select"
                            name="content_interval.days"
                            value={formData.content_interval.days}
                            onChange={handleFormChange}
                            label="Days"
                            error={!!formErrors.content_interval.days}
                            helperText={formErrors.content_interval.days}
                          >
                            {Array.from({ length: 6 }, (_, day) => (
                              <MenuItem key={day} value={day}>
                                {day}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth variant="outlined" error={!!formErrors.content_interval.hours}>
                          <InputLabel id="content-interval-hours-select-label">Hours</InputLabel>
                          <Select
                            labelId="content-interval-hours-select-label"
                            id="content-interval-hours-select"
                            name="content_interval.hours"
                            value={formData.content_interval.hours}
                            onChange={handleFormChange}
                            label="Hours"
                            error={!!formErrors.content_interval.hours}
                            helperText={formErrors.content_interval.hours}
                          >
                            {Array.from({ length: 24 }, (_, hour) => (
                              <MenuItem key={hour} value={hour}>
                                {hour}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth variant="outlined" error={!!formErrors.content_interval.minutes}>
                          <InputLabel id="content-interval-minutes-select-label">Minutes</InputLabel>
                          <Select
                            labelId="content-interval-minutes-select-label"
                            id="content-interval-minutes-select"
                            name="content_interval.minutes"
                            value={formData.content_interval.minutes}
                            onChange={handleFormChange}
                            label="Minutes"
                            error={!!formErrors.content_interval.minutes}
                            helperText={formErrors.content_interval.minutes}
                          >
                            {Array.from({ length: 60 }, (_, min) => (
                              <MenuItem key={min} value={min}>
                                {min}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </StyledFormRow>
                    </>
                  )}
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={handleToggleResponseFields}
                    fullWidth
                    sx={{ marginBottom: '16px' }}
                  >
                    {showResponseFields ? 'Disable Response' : 'Enable Response'}
                  </Button>
                  {showResponseFields && (
                    <>
                      {/* Response Content Fields */}
                      <Typography variant="h5" sx={{ marginBottom: '16px' }}>
                        Response Content
                      </Typography>
                      <StyledFormRow sx={{ marginBottom: '16px' }}>
                        <FormControl fullWidth variant="outlined" error={!!formErrors.type}>
                          <InputLabel id="type-select-label">Response Type</InputLabel>
                          <Select
                            labelId="type-select-label"
                            id="type-select"
                            name="responsetype"
                            value={formData.responsetype}
                            onChange={handleFormChange}
                            label="Type"
                            error={!!formErrors.responsetype}
                            helperText={formErrors.responsetype}
                          >
                            <MenuItem value="workflow">Select Workflow</MenuItem>
                            {/* <MenuItem value="new">New Workflow</MenuItem> */}
                          </Select>
                          {formErrors.responsetype && <FormHelperText>{formErrors.responsetype}</FormHelperText>}
                        </FormControl>
                      </StyledFormRow>

                      {formData.responsetype === 'workflow' && (
                        <StyledFormRow sx={{ marginBottom: '16px' }}>
                          <FormControl fullWidth variant="outlined" error={!!formErrors.type}>
                            <InputLabel id="type-select-label">Response Type</InputLabel>
                            <Select
                              labelId="type-select-label"
                              id="type-select"
                              name="tt_workflow_id"
                              value={formData.tt_workflow_id}
                              onChange={handleFormChange}
                              label="Type"
                              error={!!formErrors.tt_workflow_id}
                              helperText={formErrors.tt_workflow_id}
                            >
                              {contents.map((workflow) => (
                                <MenuItem key={workflow.step} value={workflow.id}>
                                  {workflow.content.content}
                                </MenuItem>
                              ))}
                            </Select>
                            {formErrors.responsetype && <FormHelperText>{formErrors.responsetype}</FormHelperText>}
                          </FormControl>
                        </StyledFormRow>
                      )}
                    </>
                  )}
                  <StyledFormRow>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Workflow Condition</InputLabel>
                      <Select
                        id="wf_condition"
                        name="wf_condition"
                        value={formData.wf_condition}
                        onChange={handleFormChange}
                        label="workflow condition"
                      >
                        <MenuItem value="">NA</MenuItem>
                        <MenuItem value="capture_language">capture_language</MenuItem>
                        <MenuItem value="assesment_validate">assesment_validate</MenuItem>
                        <MenuItem value="start_assessment">start_assessment</MenuItem>
                        <MenuItem value="unsuccessful_assessment">unsuccessful_assessment</MenuItem>
                        <MenuItem value="level_completed">level_completed</MenuItem>
                        <MenuItem value="quiz_completed">quiz_completed</MenuItem>
                        {/* Add more variables as needed */}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Workflow Trigger</InputLabel>
                      <Select
                        id="wf_trigger"
                        name="wf_trigger"
                        value={formData.wf_trigger}
                        onChange={handleFormChange}
                        label="workflow Trigger"
                      >
                        <MenuItem value="">NA</MenuItem>
                        <MenuItem value="in_assessment">in_assessment</MenuItem>

                        {/* Add more variables as needed */}
                      </Select>
                    </FormControl>
                  </StyledFormRow>
                </Grid>
                <Grid item xs={6}>
                  {/* Options Fields */}
                  {(formData.type === 'question' || formData.type === 'assessment') && (
                    <>
                      <Typography variant="h5">Options</Typography>
                      {/* Render option inputs here */}
                      {formData.options.map((option, index) => (
                        <div key={index}>
                          <StyledFormRow>
                            <TextField
                              name={`options[${index}].content_option`}
                              label={`Option ${index + 1}`}
                              value={option.content_option}
                              onChange={handleFormChange}
                              variant="outlined"
                              fullWidth
                            />
                            <TextField
                              name={`options[${index}].score`}
                              label="Score"
                              value={option.score}
                              onChange={handleFormChange}
                              variant="outlined"
                              fullWidth
                            />

                            <Button variant="outlined" color="secondary" onClick={() => handleRemoveOption(index)}>
                              X
                            </Button>
                          </StyledFormRow>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name={`options[${index}].hasResponse`}
                                checked={option.hasResponse}
                                onChange={handleFormChange} // Update the handler to handleFormChange
                              />
                            }
                            label="Enable Quick Reply Response"
                          />
                          {option.hasResponse && (
                            <>
                              <FormControl fullWidth variant="outlined" error={!!formErrors.type}>
                                <InputLabel id="type-select-label">Response Type</InputLabel>
                                <Select
                                  labelId="type-select-label"
                                  id="type-select"
                                  name={`options[${index}].response.responsetype`}
                                  value={option.response.responsetype}
                                  onChange={handleFormChange}
                                  label="Type"
                                >
                                  <MenuItem value="workflow">Select Workflow</MenuItem>
                                  {/* <MenuItem value="new">New Workflow</MenuItem> */}
                                </Select>
                                {formErrors.responsetype && <FormHelperText>{formErrors.responsetype}</FormHelperText>}
                              </FormControl>

                              {option.response.responsetype === 'workflow' && (
                                <StyledFormRow sx={{ marginBottom: '16px' }}>
                                  <FormControl fullWidth variant="outlined" error={!!formErrors.type}>
                                    <InputLabel id="type-select-label">Response Type</InputLabel>
                                    <Select
                                      labelId="type-select-label"
                                      id="type-select"
                                      name={`options[${index}].response.tt_workflow_id`}
                                      value={option.response.tt_workflow_id}
                                      onChange={handleFormChange}
                                      label="Type"
                                      error={!!formErrors.tt_workflow_id}
                                      helperText={formErrors.tt_workflow_id}
                                    >
                                      {contents.map((workflow) => (
                                        <MenuItem key={workflow.step} value={workflow.id}>
                                          {workflow.content.content}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </StyledFormRow>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                      {/* Add new option button */}
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleAddOption}
                        fullWidth
                        sx={{ marginBottom: '16px' }}
                      >
                        Add Option
                      </Button>
                    </>
                  )}

                  {/* Content Variables */}
                  <Typography variant="h5">Variables</Typography>
                  {/* Render content variable dropdown inputs here */}
                  {formData.variables.map((variable, index) => (
                    <div key={index}>
                      <StyledFormRow>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id={`variable-select-label-${index}`}>Variable</InputLabel>
                          <Select
                            labelId={`variable-select-label-${index}`}
                            id={`variable-select-${index}`}
                            name={`variables[${index}].var_val`}
                            value={variable.var_val}
                            onChange={handleFormChange}
                            label="Variable"
                          >
                            <MenuItem value="{organisation_name}">organisation_name</MenuItem>
                            <MenuItem value="{user_name}">user_name</MenuItem>
                            <MenuItem value="{user_language}">user_language</MenuItem>
                            <MenuItem value="{user_Program}">user_Program</MenuItem>
                            <MenuItem value="{user_level}">user_level</MenuItem>
                            <MenuItem value="{user_level_plus_one}">user_level_plus_one</MenuItem>
                            <MenuItem value="{user_week}">user_week</MenuItem>
                            <MenuItem value="{lesson_no}">lesson_no</MenuItem>
                            <MenuItem value="{week_no}">week_no</MenuItem>
                            <MenuItem value="{week_plus_one_no}">week_plus_one_no</MenuItem>
                            <MenuItem value="{user_lesson}">user_lesson</MenuItem>
                            <MenuItem value="{quiz_remainder_duration}">quiz_remainder_duration</MenuItem>
                            <MenuItem value="{user_lesson_video}">user_lesson_video</MenuItem>
                            <MenuItem value="{user_certificate}">user_certificate</MenuItem>

                            {/* Add more variables as needed */}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id={`variable-select-label-${index}`}>Type</InputLabel>
                          <Select
                            labelId={`variable-select-label-${index}`}
                            id={`variable-select-${index}`}
                            name={`variables[${index}].type`}
                            value={variable.type}
                            onChange={handleFormChange}
                            label="Variable"
                          >
                            <MenuItem value="cta">CTA</MenuItem>
                            <MenuItem value="hv">Header Video</MenuItem>
                            <MenuItem value="hi">Header Image</MenuItem>
                            <MenuItem value="body">Body</MenuItem>

                            {/* Add more variables as needed */}
                          </Select>
                        </FormControl>

                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleRemoveVariable(index)}
                          sx={{
                            marginTop: '0',
                          }}
                        >
                          X
                        </Button>
                      </StyledFormRow>
                      <StyledFormRow>
                        {(variable.type === 'cta' ||
                          variable.type === 'hv' ||
                          variable.type === 'hi' ||
                          variable.var_val === '{user_level}' ||
                          variable.var_val === '{user_level_plus_one}' ||
                          variable.var_val === '{lesson_no}' ||
                          variable.var_val === '{week_no}') && (
                          <TextField
                            name={`variables[${index}].data`}
                            label="Content"
                            value={variable.data}
                            onChange={handleFormChange}
                            variant="outlined"
                            fullWidth
                            sx={{ marginBottom: '16px' }}
                          />
                        )}
                      </StyledFormRow>
                    </div>
                  ))}
                  {/* Add new option button */}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleAddVariable}
                    fullWidth
                    sx={{
                      marginTop: '0px',
                    }}
                  >
                    Add Variable
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
                    {isEditMode ? 'Save' : 'Create New Workflow'}
                  </Button>
                </Grid>
              </Grid>
            </StyledForm>
          </div>
          {/* Snackbar for success or failure message */}
          <StyledSnackbar open={!!successMessage || !!failureMessage} onClose={handleSnackbarClose}>
            <div>{successMessage || failureMessage}</div>
          </StyledSnackbar>
        </StyledCard>
      </StyledModal>

      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Delete Program?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the workflow {selectedRow?.id}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              deleteWorkflow();
              setIsConfirmOpen(false);
            }}
            autoFocus
            sx={{ color: 'error.main' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
