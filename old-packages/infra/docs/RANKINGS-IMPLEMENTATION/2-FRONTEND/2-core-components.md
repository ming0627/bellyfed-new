# 2. Core Components Implementation

This document outlines the implementation plan for the core UI components required for the Rankings feature.

## Overview

The core components will provide the user interface for creating, viewing, and managing rankings. These components will be reusable across different pages and contexts.

## Implementation Tasks

### 1. RankingForm Component

- [ ] Create RankingForm component
    - File: `src/components/rankings/RankingForm.tsx`
    - Implement form for numerical ranking (1-5)
    - Add taste status selection (Acceptable, Second Chance, Dissatisfied)
    - Include notes field with character counter
    - Integrate photo upload component

### 2. PhotoUploader Component

- [ ] Create PhotoUploader component
    - File: `src/components/shared/PhotoUploader.tsx`
    - Implement drag-and-drop interface
    - Add file selection dialog
    - Show upload progress
    - Handle multiple photos

### 3. RankingCard Component

- [ ] Create RankingCard component
    - File: `src/components/rankings/RankingCard.tsx`
    - Display ranking information
    - Show photos in gallery format
    - Add edit and delete options

### 4. RankingStats Component

- [ ] Create RankingStats component
    - File: `src/components/rankings/RankingStats.tsx`
    - Display average ranking
    - Show distribution of rankings
    - Visualize data with charts

## Implementation Details

### RankingForm Component

```tsx
// src/components/rankings/RankingForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PhotoUploader } from '@/components/shared/PhotoUploader';
import {
    Button,
    TextField,
    RadioGroup,
    Radio,
    FormControlLabel,
    FormControl,
    FormLabel,
    Typography,
    Box,
    Divider,
    Alert,
} from '@mui/material';
import { Dish } from '@/types/dish';
import { RankingInput } from '@/types/ranking';

// Validation schema
const rankingSchema = z
    .object({
        dishId: z.string().uuid(),
        restaurantId: z.string().uuid(),
        dishType: z.string().optional(),
        rank: z.number().int().min(1).max(5).optional(),
        tasteStatus: z.enum(['ACCEPTABLE', 'SECOND_CHANCE', 'DISSATISFIED']).optional(),
        notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
    })
    .refine((data) => (data.rank !== undefined) !== (data.tasteStatus !== undefined), {
        message: 'Either rank or taste status must be provided, but not both',
        path: ['rank'],
    });

type RankingFormData = z.infer<typeof rankingSchema>;

interface RankingFormProps {
    dish: Dish;
    existingRanking?: {
        rank?: number;
        tasteStatus?: 'ACCEPTABLE' | 'SECOND_CHANCE' | 'DISSATISFIED';
        notes?: string;
        photos: Array<{ id: string; photoUrl: string }>;
    };
    onSubmit: (data: RankingInput) => Promise<void>;
    onCancel: () => void;
}

export const RankingForm: React.FC<RankingFormProps> = ({
    dish,
    existingRanking,
    onSubmit,
    onCancel,
}) => {
    const [photoUrls, setPhotoUrls] = useState<string[]>(
        existingRanking?.photos?.map((photo) => photo.photoUrl) || []
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rankingType, setRankingType] = useState<'rank' | 'tasteStatus'>(
        existingRanking?.rank !== undefined ? 'rank' : 'tasteStatus'
    );

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<RankingFormData>({
        resolver: zodResolver(rankingSchema),
        defaultValues: {
            dishId: dish.id,
            restaurantId: dish.restaurantId,
            dishType: dish.category,
            rank: existingRanking?.rank,
            tasteStatus: existingRanking?.tasteStatus,
            notes: existingRanking?.notes || '',
        },
    });

    const notes = watch('notes') || '';

    // Handle ranking type change
    useEffect(() => {
        if (rankingType === 'rank') {
            setValue('tasteStatus', undefined);
        } else {
            setValue('rank', undefined);
        }
    }, [rankingType, setValue]);

    // Handle photo upload
    const handlePhotoUploaded = (photoUrl: string) => {
        setPhotoUrls((prev) => [...prev, photoUrl]);
    };

    // Handle photo removal
    const handlePhotoRemoved = (photoUrl: string) => {
        setPhotoUrls((prev) => prev.filter((url) => url !== photoUrl));
    };

    // Handle form submission
    const onFormSubmit = async (data: RankingFormData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            await onSubmit({
                ...data,
                photoUrls,
            });
        } catch (err) {
            setError('Failed to save ranking. Please try again.');
            console.error('Error submitting ranking:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate sx={{ mt: 1 }}>
            <Typography variant="h6" gutterBottom>
                {existingRanking ? 'Edit Ranking' : 'Add Ranking'} for {dish.name}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
                Restaurant: {dish.restaurantName}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <FormControl component="fieldset" margin="normal" fullWidth>
                <FormLabel component="legend">Ranking Type</FormLabel>
                <RadioGroup
                    row
                    value={rankingType}
                    onChange={(e) => setRankingType(e.target.value as 'rank' | 'tasteStatus')}
                >
                    <FormControlLabel value="rank" control={<Radio />} label="Numerical Rank" />
                    <FormControlLabel
                        value="tasteStatus"
                        control={<Radio />}
                        label="Taste Status"
                    />
                </RadioGroup>
            </FormControl>

            {rankingType === 'rank' && (
                <FormControl component="fieldset" margin="normal" fullWidth error={!!errors.rank}>
                    <FormLabel component="legend">Rank (1 is best, 5 is worst)</FormLabel>
                    <Controller
                        name="rank"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                row
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                            >
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <FormControlLabel
                                        key={value}
                                        value={value}
                                        control={<Radio />}
                                        label={value.toString()}
                                    />
                                ))}
                            </RadioGroup>
                        )}
                    />
                    {errors.rank && (
                        <Typography variant="caption" color="error">
                            {errors.rank.message}
                        </Typography>
                    )}
                </FormControl>
            )}

            {rankingType === 'tasteStatus' && (
                <FormControl
                    component="fieldset"
                    margin="normal"
                    fullWidth
                    error={!!errors.tasteStatus}
                >
                    <FormLabel component="legend">Taste Status</FormLabel>
                    <Controller
                        name="tasteStatus"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup row {...field} value={field.value || ''}>
                                <FormControlLabel
                                    value="ACCEPTABLE"
                                    control={<Radio />}
                                    label="Acceptable"
                                />
                                <FormControlLabel
                                    value="SECOND_CHANCE"
                                    control={<Radio />}
                                    label="Second Chance"
                                />
                                <FormControlLabel
                                    value="DISSATISFIED"
                                    control={<Radio />}
                                    label="Dissatisfied"
                                />
                            </RadioGroup>
                        )}
                    />
                    {errors.tasteStatus && (
                        <Typography variant="caption" color="error">
                            {errors.tasteStatus.message}
                        </Typography>
                    )}
                </FormControl>
            )}

            <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        margin="normal"
                        fullWidth
                        multiline
                        rows={4}
                        label="Notes"
                        error={!!errors.notes}
                        helperText={errors.notes?.message || `${notes.length}/1000 characters`}
                    />
                )}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
                Photos
            </Typography>

            <PhotoUploader
                onPhotoUploaded={handlePhotoUploaded}
                onPhotoRemoved={handlePhotoRemoved}
                existingPhotos={photoUrls}
                maxPhotos={5}
            />

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : existingRanking ? 'Update' : 'Save'}
                </Button>
            </Box>
        </Box>
    );
};
```

### PhotoUploader Component

```tsx
// src/components/shared/PhotoUploader.tsx
import React, { useState, useRef } from 'react';
import { Box, Button, Typography, CircularProgress, IconButton, Grid } from '@mui/material';
import { CloudUpload, Delete, Add } from '@mui/icons-material';
import { uploadPhoto } from '@/lib/api/photoUploadApi';

interface PhotoUploaderProps {
    onPhotoUploaded: (photoUrl: string) => void;
    onPhotoRemoved: (photoUrl: string) => void;
    existingPhotos?: string[];
    maxPhotos?: number;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
    onPhotoUploaded,
    onPhotoRemoved,
    existingPhotos = [],
    maxPhotos = 5,
}) => {
    const [photos, setPhotos] = useState<string[]>(existingPhotos);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileChange = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        // Check if adding the new files would exceed the maximum
        if (photos.length + files.length > maxPhotos) {
            alert(`You can only upload a maximum of ${maxPhotos} photos.`);
            return;
        }

        setUploading(true);

        try {
            // Upload each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Only image files are allowed.');
                    continue;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB.');
                    continue;
                }

                // Upload the file
                const photoUrl = await uploadPhoto(file, (progress) => {
                    setUploadProgress(progress);
                });

                // Add the photo URL to the list
                setPhotos((prev) => [...prev, photoUrl]);
                onPhotoUploaded(photoUrl);
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Failed to upload photo. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Handle drag events
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    // Handle drop event
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files) {
            handleFileChange(e.dataTransfer.files);
        }
    };

    // Handle file input click
    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    // Handle photo removal
    const handleRemovePhoto = (photoUrl: string) => {
        setPhotos((prev) => prev.filter((url) => url !== photoUrl));
        onPhotoRemoved(photoUrl);
    };

    return (
        <Box>
            {/* Photo grid */}
            {photos.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {photos.map((photoUrl, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    paddingTop: '100%', // 1:1 aspect ratio
                                    backgroundColor: 'grey.100',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    component="img"
                                    src={photoUrl}
                                    alt={`Photo ${index + 1}`}
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        },
                                    }}
                                    onClick={() => handleRemovePhoto(photoUrl)}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>
                        </Grid>
                    ))}

                    {/* Add photo button in grid */}
                    {photos.length < maxPhotos && !uploading && (
                        <Grid item xs={6} sm={4} md={3}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 0,
                                    paddingTop: '100%', // 1:1 aspect ratio
                                    backgroundColor: 'grey.100',
                                    borderRadius: 1,
                                    position: 'relative',
                                    cursor: 'pointer',
                                }}
                                onClick={handleButtonClick}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Add />
                                    <Typography variant="caption">Add Photo</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Upload area */}
            {(photos.length === 0 || uploading) && (
                <Box
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    sx={{
                        border: '2px dashed',
                        borderColor: dragActive ? 'primary.main' : 'grey.300',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: dragActive ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {uploading ? (
                        <Box
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <CircularProgress
                                variant="determinate"
                                value={uploadProgress}
                                sx={{ mb: 2 }}
                            />
                            <Typography variant="body2">Uploading... {uploadProgress}%</Typography>
                        </Box>
                    ) : (
                        <>
                            <CloudUpload sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
                            <Typography variant="body1" gutterBottom>
                                Drag and drop photos here, or click to select
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Maximum {maxPhotos} photos, 5MB each
                            </Typography>
                            <Button variant="outlined" onClick={handleButtonClick} sx={{ mt: 2 }}>
                                Select Photos
                            </Button>
                        </>
                    )}
                </Box>
            )}

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files)}
                style={{ display: 'none' }}
                accept="image/*"
                multiple={photos.length < maxPhotos - 1}
            />
        </Box>
    );
};
```

Due to the length of the implementation, I'll continue with the remaining components in the next file.

## Testing

- [ ] Write unit tests for RankingForm component

    - Test form validation
    - Test submission handling
    - Test photo integration

- [ ] Write unit tests for PhotoUploader component
    - Test file selection
    - Test drag and drop
    - Test upload progress
    - Test photo removal

## Dependencies

- React Hook Form for form handling
- Zod for validation
- Material UI for UI components
- API clients from previous step

## Estimated Time

- RankingForm Component: 1.5 days
- PhotoUploader Component: 1.5 days
- Testing: 1 day

Total: 4 days
