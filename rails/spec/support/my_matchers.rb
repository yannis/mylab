RSpec::Matchers.define :translate do |attribute|
  match do |model|
    model.should respond_to(attribute.to_sym)
  end
  failure_message do |model|
    "#{model.class} expected to have attribute #{attribute} translated"
  end
  failure_message do |model|
    "#{model.class} not expected to have attribute #{attribute} translated"
  end
end

RSpec::Matchers.define :act_as_list do |attribute|
  match do |model|
    model.should respond_to(:position)
    model.class.include?(ActiveRecord::Acts::List::InstanceMethods).should be_truthy
  end
  failure_message do |model|
    "#{model.class} expected to act as list"
  end
  failure_message do |model|
    "#{model.class} not expected to act as list"
  end
end


RSpec::Matchers.define :be_valid_verbose do
  match do |model|
    model.valid?
  end

  failure_message do |model|
    "#{model.class} expected to be valid but had errors:n #{model.errors.full_messages.join("n ")}"
  end

  failure_message do |model|
    "#{model.class} expected to have errors, but it did not"
  end

  description do
    "be valid"
  end
end

RSpec::Matchers.define :have_errors_on do |attribute|
  chain :with_message do |message|
    @message = message
  end

  match do |model|
    model.valid?

    @has_errors = model.errors[attribute].present?

    if @message
      @has_errors && model.errors[attribute].include?(@message)
    else
      @has_errors
    end
  end

  failure_message do |model|
    if @message
      "Validation errors #{model.errors[attribute].inspect} should include #{@message.inspect}"
    else
      "#{model.class} should have errors on attribute #{attribute.inspect}"
    end
  end

  failure_message do |model|
    "#{model.class} should not have an error on attribute #{attribute.inspect}"
  end
end

RSpec::Matchers.define :validate_associated do |associated_model|
  match do |model|
    model.should respond_to "validate_associated_records_for_#{associated_model}"
  end

  failure_message do |model|
    "#{model.class} expected to validate associated #{associated_model}"
  end

  failure_message do |model|
    "#{model.class} not expected to validate associated #{associated_model}"
  end
end


RSpec::Matchers.define :match_exactly do |expected_match_count, selector|
  match do |context|
    matching = context.all(selector)
    @matched = matching.size
    @matched == expected_match_count
  end

  failure_message do
    "expected '#{selector}' to match exactly #{expected_match_count} elements, but matched #{@matched}"
  end

  failure_message do
    "expected '#{selector}' to NOT match exactly #{expected_match_count} elements, but it did"
  end
end
