require 'rails_helper'

RSpec.describe Docx, type: :model do
  # it {is_expected.to respond_to :file}
  # it {is_expected.to respond_to :markdown}

  let!(:docx){Docx.new doc: File.new("#{fixture_path}/word_test.docx")}

  # it{expect(docx.file).to be_present}
  # it{expect(docx.data).to eql ""}
  it{expect(docx.markdown).to eql "Allogromia\n\nYou are like a micro sun\n\nnesting on the sea bottom\n\nshining in warm yellow\n\nor vivid orange all day long\n\nYour rays of pseudopodes\n\nbuild a translucent mesh\n\nWhen you cast this net\n\nwhat do you catch?\n\nCertainly algae and bacteria\n\nduring the weekdays\n\nWhile on Sundays you might prefer to dine\n\non a soup of dissolved organic matter\n\nBut such a finely woven net\n\ntrawls for more than that\n\nYou catch the shadow of a cloud\n\nthat sails along the firmament\n\nAnd the sizzling fury of lightening\n\nwhen it strikes the ocean\n\nSunrays get entangled\n\nin your pseudopodial web\n\nand frolicking gusts of wind\n\nthat dress the sea with whitecaps\n\nAnd sometimes you capture dreams\n\nthat have been lost or forgotten\n\nand finally transported by the rivers\n\ninto the sea like fallen leaves\n\nWhat do you do with your surplus catch?\n\nThe sea takes it and transforms it\n\ninto a stream of air bubbles\n\nthat raise from the ground\n\ndancing towards the ocean's surface\n\nto the eternal amazement and delight\n\nof fishes"}
end
