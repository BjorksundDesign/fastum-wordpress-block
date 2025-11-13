import { InspectorControls, RichText, URLInput,LinkControl, useBlockProps } from '@wordpress/block-editor';
import { Panel, PanelBody, PanelRow, RangeControl, ToggleControl,TextareaControl, TextControl, Button, Spinner } from '@wordpress/components';
// import './style.scss';
import React, { useState, useEffect } from 'react';
import { Image } from "@10up/block-components";




export default function Edit(props) {
    const {attributes, setAttributes} = props;
    const { numberOfCards, cardContents, buttonText, showHeading, showBody, showImage, showButton } = attributes;
    const [posts, setPosts] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState(new Set()); // State for selected tags
    const [loading, setLoading] = useState(true);
    
    const updateButtonText = (value) => {
    // Update the buttonText attribute with the new value
    setAttributes({ buttonText: value });
    // Log the new button text to verify the change
};

    useEffect(() => {
            const fetchPosts = async () => {
                const response = await fetch('/wp-json/wp/v2/posts?_embed');
                const data = await response.json();              
                setPosts(data);
                const tagIds = collectTagIds(data);
                const tagTitles = await fetchTagTitles(tagIds);
                setTags(tagTitles);
                setLoading(false);
                
            };
            fetchPosts();
        }, []);

    // if (loading) {
    //     return <Spinner />;
    // }

    const collectTagIds = (posts) => {
        const tagIds = new Set();
        posts.forEach(post => {
            post.tags.forEach(tagId => {
                tagIds.add(tagId);
            });
        });
        return Array.from(tagIds);
    }

    const fetchTagTitles = async (tagIds) => {
    const tagFetchPromises = tagIds.map(tagId => 
        fetch(`/wp-json/wp/v2/tags/${tagId}`)
            .then(response => response.json())
    );

    const tags = await Promise.all(tagFetchPromises);
    return tags.map(tag => ({
            id: tag.id,
            title: tag.name,
        }));
    };    

    const [toggles, setToggles] = useState([
        { id: 'heading', label: 'Heading', checked: true},
        { id: 'body', label: 'Body', checked: true},
        { id: 'image', label: 'Image', checked: true},
        { id: 'button', label: 'Button', checked: true},
    ]);

    const toggleChange = (id) => {
        setToggles((prevToggles) =>
            prevToggles.map((toggle) =>
                toggle.id === id ? { ...toggle, checked: !toggle.checked } : toggle
            )
        );
    };

        const moveUp = (index) => {
        if (index > 0) {
            const newToggles = [...toggles];
            const [movedToggle] = newToggles.splice(index, 1);
            newToggles.splice(index - 1, 0, movedToggle);
            setToggles(newToggles);
        }
    };

    const moveDown = (index) => {
        if (index < toggles.length - 1) {
            const newToggles = [...toggles];
            const [movedToggle] = newToggles.splice(index, 1);
            newToggles.splice(index + 1, 0, movedToggle);
            setToggles(newToggles);
        }
    };

    const handleTagChange = (tagId) => {
        const updatedSelection = new Set(selectedTags);
        if (updatedSelection.has(tagId)) {
            updatedSelection.delete(tagId); // Remove tag if already selected
        } else {
            updatedSelection.add(tagId); // Add tag if not selected
        }
        setSelectedTags(updatedSelection);        
    };

    const filteredPosts = posts.filter(post => {
        if (selectedTags.size === 0) return true; // If no tags selected, show all posts
        return post.tags.some(tagId => selectedTags.has(tagId)); // Show posts with selected tags
    }).sort((a, b) => { return new Date(b.modified) - new Date(a.modified);
    });

    const visiblePosts = filteredPosts.slice(0, numberOfCards);

    const orderedToggles = toggles.filter(toggle => toggle.checked);

    return (
    <div { ...useBlockProps() }>
            <InspectorControls>
                <PanelBody title="Card Settings">
                        <RangeControl
                            label="Number of Cards"
                            value={numberOfCards}
                            onChange={(value) => setAttributes({ numberOfCards: value })}
                            min={1}
                            max={10}
                        />
                        <PanelRow className="panelRow">
                            <TextControl
                            className="linkTextControl"
                            label={`Buttontext`}
                            value={buttonText}
                            onChange={(value) => setAttributes({ buttonText: value })}
                            />
                        </PanelRow>
                </PanelBody>
                <PanelBody title={`Tag filters (${selectedTags.size})`}>
                    <div className="panelTagWrapper">
                        {tags.map(tag => (
                                <div>
                                    <label key={tag.id}>
                                        <input
                                            type="checkbox"
                                            checked={selectedTags.has(tag.id)}
                                            onChange={() => handleTagChange(tag.id)}
                                            />
                                        {tag.title}
                                    </label>
                                </div>
                        ))}
                    </div>
                </PanelBody>
            </InspectorControls>
            <div className="cardWrapper">
                {visiblePosts.map(post => (
                    <div key={post.id} className="card">
                        <img className="image" src={post._embedded['wp:featuredmedia'][0].source_url} alt={post.title.rendered} />
                        <h2>{post.title.rendered}</h2>
                        <a href={post.link} className="button" target="_blank" rel="noopener noreferrer">
                            <RichText
                                tagName='span' // Use span to avoid extra p tags
                                className='buttonText'
                                inlineToolbar
                                label={`Button Text`}
                                value={buttonText || 'Button text'}
                                onChange={updateButtonText}
                            />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};
