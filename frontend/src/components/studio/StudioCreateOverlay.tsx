import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStudioStore } from '@/lib/store/studioStore';
import PromptBox from './PromptBox';

export default function StudioCreateOverlay() {
  const { setPromptText, addProduct, selectItem } = useStudioStore();
  const [prompt, setLocalPrompt] = useState("");
  const router = useRouter();

  const handleCreate = () => {
    if (!prompt.trim()) return;
    setPromptText(prompt);
    
    const newId = 'product_' + Date.now();
    addProduct({ id: newId, type: "product", url: "/assets/baseball_jersey.png", x: 100, y: 100, width: 300, height: 300 });
    selectItem(newId);
    
    router.push('/studio/default');
  };

  const handleTemplateClick = (templateType: string) => {
    setPromptText(`Create a new ${templateType.toLowerCase()}`);
    
    const newId = 'product_' + Date.now();
    
    let url = "/assets/baseball_jersey.png";
    if (templateType === 'Apparel') url = "/assets/baseball_jersey.png";
    else if (templateType === 'Packaging') url = "/assets/create/packaging_mockups.png";
    else if (templateType === 'Devices') url = "/assets/create/devices_mockups.png";
    else if (templateType === 'Outdoor Ads') url = "/assets/create/outdoor_ads_mockups.png";
    else if (templateType === 'Lifestyle Photo') url = "/assets/create/lifestyle_photo.png";
    else if (templateType === 'Cinematic Photo') url = "/assets/create/cinematic_photo.png";
    else if (templateType === 'Fashion Photo') url = "/assets/create/fashion_photo.png";
    else if (templateType === 'Vector Illustration') url = "/assets/create/vector_illustration.png";
    else if (templateType === 'Modern Logo') url = "/assets/create/modern_minimal_logo.png";
    
    addProduct({ id: newId, type: "product", url, x: 100, y: 100, width: 300, height: 300 });
    selectItem(newId);
    
    router.push('/studio/default');
  };

  return (
    <div className="studio-create-overlay">
      <div className="sco-content">
        <h1 className="sco-title">What are you going to create today?</h1>
        
        {/* Prompt Input Area */}
        <div style={{ maxWidth: '840px', width: '100%', marginBottom: '48px', margin: '0 auto 48px auto' }}>
          <PromptBox 
            value={prompt}
            onChange={setLocalPrompt}
            onSubmit={handleCreate}
          />
        </div>

        {/* Mockups Section */}
        <div className="sco-section">
          <div className="sco-section-header">
            <div>
              <h2>Mockups</h2>
              <p>Preview your design on a mockup in our powerful mockup generator.</p>
            </div>
            <button className="sco-explore-btn">Explore {'>'}</button>
          </div>
          <div className="sco-grid sco-grid-4">
            <div className="sco-card" onClick={() => handleTemplateClick('Apparel')}>
              <div className="sco-card-image"><Image src="/assets/create/apparel_mockups.png" alt="Apparel" fill style={{objectFit: 'cover'}} /></div>
              <div className="sco-card-info">
                <h4>Apparel</h4>
                <span>129 styles</span>
              </div>
            </div>
            <div className="sco-card" onClick={() => handleTemplateClick('Packaging')}>
              <div className="sco-card-image"><Image src="/assets/create/packaging_mockups.png" alt="Packaging" fill style={{objectFit: 'cover'}} /></div>
              <div className="sco-card-info">
                <h4>Packaging & products</h4>
                <span>84 styles</span>
              </div>
            </div>
            <div className="sco-card" onClick={() => handleTemplateClick('Devices')}>
              <div className="sco-card-image"><Image src="/assets/create/devices_mockups.png" alt="Devices" fill style={{objectFit: 'cover'}} /></div>
              <div className="sco-card-info">
                <h4>Devices</h4>
                <span>45 styles</span>
              </div>
            </div>
            <div className="sco-card" onClick={() => handleTemplateClick('Outdoor Ads')}>
              <div className="sco-card-image"><Image src="/assets/create/outdoor_ads_mockups.png" alt="Outdoor ads" fill style={{objectFit: 'cover'}} /></div>
              <div className="sco-card-info">
                <h4>Outdoor ads</h4>
                <span>32 styles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inspiration Section */}
        <div className="sco-section">
          <div className="sco-section-header">
            <div>
              <h2>Inspiration collections</h2>
              <p>Create photorealistic images, illustrations, or logos with unique design taste.</p>
            </div>
            <button className="sco-explore-btn">Explore {'>'}</button>
          </div>
          <div className="sco-grid sco-grid-5">
            <div className="sco-card" onClick={() => handleTemplateClick('Lifestyle Photo')}>
              <div className="sco-card-image"><Image src="/assets/create/lifestyle_photo.png" alt="Lifestyle photo" fill style={{objectFit: 'cover'}} /></div>
              <div className="sco-card-info">
                <h4>Lifestyle photo</h4>
                <span>Prompt template</span>
              </div>
            </div>
            <div className="sco-card" onClick={() => handleTemplateClick('Cinematic Photo')}>
              <div className="sco-card-image"><Image src="/assets/create/cinematic_photo.png" alt="Cinematic photo" fill style={{objectFit: 'cover'}} /></div>
              <div className="sco-card-info">
                <h4>Cinematic photo</h4>
                <span>Prompt template</span>
              </div>
            </div>
            <div className="sco-card" onClick={() => handleTemplateClick('Fashion Photo')}>
              <div className="sco-card-image"><Image src="/assets/create/fashion_photo.png" alt="Fashion photo" fill style={{objectFit: 'cover'}} /></div>
              <div className="sco-card-info">
                <h4>Fashion photo</h4>
                <span>Prompt template</span>
              </div>
            </div>
            <div className="sco-card" onClick={() => handleTemplateClick('Vector Illustration')}>
              <div className="sco-card-image"><Image src="/assets/create/vector_illustration.png" alt="Vector illustration" fill style={{objectFit: 'cover'}} /></div>
              <div className="sco-card-info">
                <h4>Vector illustration</h4>
                <span>Prompt template</span>
              </div>
            </div>
            <div className="sco-card" onClick={() => handleTemplateClick('Modern Logo')}>
              <div className="sco-card-image"><Image src="/assets/create/modern_minimal_logo.png" alt="Modern minimal logo" fill style={{objectFit: 'cover'}} /></div>
              <div className="sco-card-info">
                <h4>Modern minimal logo</h4>
                <span>Prompt template</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
