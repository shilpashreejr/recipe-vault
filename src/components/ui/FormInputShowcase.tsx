"use client";
import React, { useState } from 'react';
import FormInput from './FormInput';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Search, 
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react';

export const FormInputShowcase: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    search: '',
    date: '',
    location: '',
    card: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Simple validation examples
    if (field === 'email' && value && !value.includes('@')) {
      setErrors(prev => ({ ...prev, [field]: 'Please enter a valid email address' }));
    } else if (field === 'password' && value && value.length < 6) {
      setErrors(prev => ({ ...prev, [field]: 'Password must be at least 6 characters' }));
    } else if (field === 'email' && value && value.includes('@') && value.includes('.')) {
      setSuccess(prev => ({ ...prev, [field]: true }));
    } else if (field === 'password' && value && value.length >= 6) {
      setSuccess(prev => ({ ...prev, [field]: true }));
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-4">Elegant Form Inputs</h2>
        <p className="text-muted-foreground">
          Modern form inputs with floating labels, sophisticated interactions, and elegant styling.
        </p>
      </div>

      <div className="space-y-8">
        {/* Input Variants */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Input Variants</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormInput
              label="Default Input"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            
            <FormInput
              label="Filled Input"
              variant="filled"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              success={success.email}
            />
            
            <FormInput
              label="Outlined Input"
              variant="outlined"
              placeholder="Enter your phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
        </div>

        {/* Input Sizes */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Input Sizes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="Small Input"
              size="sm"
              placeholder="Small size"
            />
            
            <FormInput
              label="Medium Input"
              size="md"
              placeholder="Medium size (default)"
            />
            
            <FormInput
              label="Large Input"
              size="lg"
              placeholder="Large size"
            />
          </div>
        </div>

        {/* Inputs with Icons */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Inputs with Icons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Full Name"
              icon={<User className="w-5 h-5" />}
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            
            <FormInput
              label="Email Address"
              icon={<Mail className="w-5 h-5" />}
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              success={success.email}
            />
            
            <FormInput
              label="Password"
              icon={<Lock className="w-5 h-5" />}
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              success={success.password}
            />
            
            <FormInput
              label="Phone Number"
              icon={<Phone className="w-5 h-5" />}
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
        </div>

        {/* Specialized Inputs */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Specialized Inputs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Search Recipes"
              icon={<Search className="w-5 h-5" />}
              placeholder="Search for recipes..."
              value={formData.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
            />
            
            <FormInput
              label="Date"
              icon={<Calendar className="w-5 h-5" />}
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
            
            <FormInput
              label="Location"
              icon={<MapPin className="w-5 h-5" />}
              placeholder="Enter your location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
            
            <FormInput
              label="Card Number"
              icon={<CreditCard className="w-5 h-5" />}
              placeholder="1234 5678 9012 3456"
              value={formData.card}
              onChange={(e) => handleInputChange('card', e.target.value)}
            />
          </div>
        </div>

        {/* Error and Success States */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Error and Success States</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Email with Error"
              type="email"
              placeholder="Enter invalid email"
              value="invalid-email"
              error="Please enter a valid email address"
            />
            
            <FormInput
              label="Email with Success"
              type="email"
              placeholder="Enter valid email"
              value="valid@email.com"
              success={true}
            />
            
            <FormInput
              label="Password with Error"
              type="password"
              placeholder="Enter short password"
              value="123"
              error="Password must be at least 6 characters"
            />
            
            <FormInput
              label="Password with Success"
              type="password"
              placeholder="Enter strong password"
              value="strongpassword123"
              success={true}
            />
          </div>
        </div>

        {/* Helper Text Examples */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Helper Text Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Username"
              placeholder="Enter your username"
              helperText="Username must be between 3-20 characters and contain only letters, numbers, and underscores."
            />
            
            <FormInput
              label="Recipe Title"
              placeholder="Enter recipe title"
              helperText="Choose a descriptive title that will help others find your recipe."
            />
          </div>
        </div>

        {/* Interactive Form Example */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Interactive Form Example</h3>
          <div className="p-6 rounded-lg bg-card border space-y-4">
            <h4 className="font-medium">User Registration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                placeholder="Enter your first name"
                helperText="This will be displayed on your profile"
              />
              
              <FormInput
                label="Last Name"
                placeholder="Enter your last name"
                helperText="This will be displayed on your profile"
              />
              
              <FormInput
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                success={success.email}
                helperText="We'll never share your email with anyone else"
              />
              
              <FormInput
                label="Password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                success={success.password}
                helperText="Must be at least 6 characters long"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 